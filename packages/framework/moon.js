import {loadSettings} from "./config";

const initializeMoonObject = async () => {
    const settings = await loadSettings();

    global.moon = {
        /**
         * Applies the configured asset path to this resource.
         *
         * @param path          The path of the resource without any configured
         *                      asset context.
         *
         * @returns {string}
         */
        asset: (path) => {
            const assetContextPath = settings.assets?.context ?? '';
            return `${assetContextPath}${path}`;
        }
    };
};

export { initializeMoonObject };
