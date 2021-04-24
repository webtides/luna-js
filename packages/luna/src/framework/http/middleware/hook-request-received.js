import {callHook} from "../../hooks/index.js";
import {HOOKS} from "../../hooks/definitions.js";

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
