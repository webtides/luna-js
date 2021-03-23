import {callHook} from "../../hooks";
import {HOOKS} from "../../hooks/definitions";

/**
 * Registers a middleware that calls the REQUEST_RECEIVED hook.
 *
 * @param app
 */
const register = ({ app }) => {
    app.use(async (request, response, next) => {
        await callHook(HOOKS.REQUEST_RECEIVED, {
            request,
            response
        });

        next();
    });
};

export default register;
