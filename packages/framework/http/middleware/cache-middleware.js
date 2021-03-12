import {getSettings} from "../../config";
import {isInCache, loadFromCache, writeToCache} from "../../cache/cache";


const isRequestCacheable = request => {
    if (request.method !== 'GET') {
        return false;
    }

    const settings = getSettings();

    const { cacheable } = settings.routes;
    for (const row of cacheable) {

        if (new RegExp(row).test(request.path)) {
            return true;
        }

    }

    return false;
}

/**
 * The global route cache middleware. Here we can react on requests
 * that can be cached.
 *
 * Should be registered after any custom auth middleware could be called.
 *
 * @returns {function(*=, *, *): void}
 */
const cacheMiddleware = () => (request, response, next) => {
    if (isRequestCacheable(request)) {
        const cacheKey = `${request.path}.${JSON.stringify(request.query)}`;

        if (isInCache(cacheKey, 'routes')) {
            loadFromCache(cacheKey, 'routes')
                .then(result => {
                    response.send(result).end();
                })
            return;
        }

        request.moon = request.moon ?? {};
        request.moon.isCacheable = true;

        response.on('finish', () => {

            if (request.moon?.cachedResponse) {
                writeToCache(cacheKey, request.moon.cachedResponse, 'routes');
            }
        });
    }

    next();
};

export { cacheMiddleware };
