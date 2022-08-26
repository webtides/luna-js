import { callHook } from '../../hooks/index.js';
import { HOOKS } from '../../hooks/definitions.js';

/**
 * Middleware that calls the REQUEST_RECEIVED hook.
 */
export const hookRequestReceivedMiddleware = () => async (request, response, next) => {
	await callHook(HOOKS.REQUEST_RECEIVED, {
		request,
		response,
	});

	next();
};
