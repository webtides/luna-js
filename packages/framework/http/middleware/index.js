import hookMiddleware from "./hook-middleware";
import {callHook} from "../../hooks";
import {HOOKS} from "../../hooks/definitions";

const registerMiddleware = async ({ app }) => {
    await callHook(HOOKS.MIDDLEWARE_REGISTER, {
       app
    });

    hookMiddleware({ app });
};

export { registerMiddleware };
