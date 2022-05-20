import {callHook} from "../../hooks";
import {HOOKS} from "../../hooks/definitions";

/**
 * Middleware that calls the REQUEST_RECEIVED hook.
 */
export const hookRequestReceivedMiddleware = () => async (request, response, next) => {
	await callHook(HOOKS.REQUEST_RECEIVED, {
		request,
		response
	});

	next();
};
