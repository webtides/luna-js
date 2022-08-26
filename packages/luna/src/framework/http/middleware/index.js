import { callHook } from '../../hooks';
import { HOOKS } from '../../hooks/definitions';
import { cacheMiddleware } from './cache-middleware.js';
import { hookRequestReceivedMiddleware } from './hook-request-received.js';
import { serverMethodMiddleware } from './server-method-middleware.js';

const registerMiddleware = async ({ app }) => {
	await callHook(HOOKS.MIDDLEWARE_REGISTER, {
		app,
	});

	app.use(hookRequestReceivedMiddleware());
	app.use(cacheMiddleware());
	app.use(serverMethodMiddleware());
};

const parseMiddleware = async ({ middleware }) => {
	if (typeof middleware === 'function') {
		return middleware();
	}

	return middleware ?? [];
};

export { parseMiddleware, registerMiddleware };
