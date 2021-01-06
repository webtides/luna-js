import {registerAvailableComponents} from "../../framework/loaders/component-loader";


const prepareForDocker = async () => {
    const availableComponents = (await registerAvailableComponents({generateCssBundles: true}));

    const generatedDirectory = path.join(settings.buildDirectory, "generated");
    if (!fs.existsSync(generatedDirectory)) {
        fs.mkdirSync(generatedDirectory);
    }

    const manifest = {availableComponents};

    fs.writeFileSync(path.join(generatedDirectory, "manifest.json"), JSON.stringify(manifest), {encoding: "utf-8"});
};
