import hookMiddleware from "./hook-request-received.js";
import {callHook} from "../../hooks/index.js";
import {HOOKS} from "../../hooks/definitions.js";

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
