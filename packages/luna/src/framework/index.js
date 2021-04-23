import './bootstrap.js';

import {callHook} from "./hooks";
import {HOOKS} from "./hooks/definitions";
import {initializeLuna, prepareLuna} from "./luna";
import ComponentLoader from "./loaders/component-loader";
import Server from "./http/server";

const startLuna = async ({ config } = {}) => {
    global.luna = undefined;

    if (!(await prepareLuna({ config }))) {
        console.log("Could not start luna-js. Have you created your luna.config.js?");
        return;
    }

    await initializeLuna();

    await callHook(HOOKS.HOOKS_LOADED);

    const componentLoader = luna.get(ComponentLoader);
    await componentLoader.registerAvailableComponents();

    await callHook(HOOKS.COMPONENTS_LOADED, {
        components: componentLoader.getAvailableComponents()
    });

    const server = luna.get(Server);
    await server.start();
};

const stopLuna = async () => {
    const server = luna.get(Server);
    await server.stop();
}

export { startLuna, stopLuna };
