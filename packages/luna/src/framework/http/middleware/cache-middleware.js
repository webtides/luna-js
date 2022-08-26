import { getSettings } from '../../config.js';
import LunaCache from '../../cache/luna-cache.js';

/**
 * Looks inside the luna.config.js to determine whether or not the
 * current request is cacheable or not.
 *
 * @param request           The express request method
 *
 * @returns {boolean}
 */
const isRequestCacheable = (request) => {
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
};

/**
 * The global route cache middleware. Here we can react on requests
 * that can be cached.
 *
 * Should be registered after any custom auth middleware could be called.
 *
 * @returns {function(*, *, *): Promise<*>}
 */
const cacheMiddleware = () => async (request, response, next) => {
	if (isRequestCacheable(request)) {
		const cache = luna.get(LunaCache);

		const cacheKey = `${request.path}.${JSON.stringify(request.query)}`;

		if (await cache.has(cacheKey, 'routes')) {
			cache.get(cacheKey, 'routes').then((result) => {
				response.send(result).end();
			});
			return;
		}

		request.$$luna = request.$$luna ?? {};
		request.$$luna.isCacheable = true;

		response.on('finish', () => {
			if (request.$$luna?.cachedResponse) {
				cache.set(cacheKey, request.$$luna.cachedResponse, 'routes');
			}
		});
	}

	next();
};

export { cacheMiddleware };
