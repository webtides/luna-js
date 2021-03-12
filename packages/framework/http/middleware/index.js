import hookMiddleware from "./hook-request-received";
import {callHook} from "../../hooks";
import {HOOKS} from "../../hooks/definitions";

const registerMiddleware = async ({ app }) => {
    await callHook(HOOKS.MIDDLEWARE_REGISTER, {
       app
    });

    hookMiddleware({ app });
};

const parseMiddleware = async ({ middleware }) => {
    if (typeof middleware === 'function') {
        return middleware();
    }

    return middleware ?? [];
};

export { parseMiddleware, registerMiddleware };
