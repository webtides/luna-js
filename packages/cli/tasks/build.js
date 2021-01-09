import * as rollup from "rollup";
import loadConfigFile from "rollup/dist/loadConfigFile";

const startRollupWatch = async (configFile, callback = () => {
}) => {
    const {options, warnings} = await loadConfigFile(configFile);
    warnings.flush();

    const watcher = rollup.watch(options);
    watcher.on("event", ({code, result}) => {
        switch (code) {
            case "BUNDLE_END":
                result.close();
                return;
            case "START":
                break;
            case "END":
                console.log("END BUNDLE!!!");
                callback();
                break;
        }
    });
}

const startRollup = async (configFile) => {
    const {options, warnings} = await loadConfigFile(configFile);
    warnings.flush();

    for (const option of options) {
        const bundle = await rollup.rollup(option);

        for (const outputOptions of option.output) {
            await bundle.write(option.output[0]);
        }

        await bundle.close();
    }
}

export {
    startRollup,
    startRollupWatch
}
