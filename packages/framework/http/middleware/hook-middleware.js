import {callHook} from "../../hooks";
import {HOOKS} from "../../hooks/definitions";

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
