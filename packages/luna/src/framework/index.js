import './bootstrap.js';

import {callHook} from "./hooks";
import {HOOKS} from "./hooks/definitions";
import {initializeLuna, prepareLuna} from "./luna";
import ComponentLoader from "./loaders/component-loader";
import Server from "./http/server";

let lunaIsRunning = false;

const startLuna = async ({ config } = {}) => {
    if (lunaIsRunning) {
        return;
    }

    lunaIsRunning = true;

    if (!(await prepareLuna({ config }))) {
        console.log("Could not start luna-js. Have you created your luna.config.js?");
        lunaIsRunning = false;
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

export { startLuna };
