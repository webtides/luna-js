const glob = require("glob");
const fs = require("fs");
const path = require("path");

const getPathRelativeToBasePath = (path, basePath) => {
    return path.substring(basePath.length - 1);
};

module.exports = function(options) {
    return {
        name: 'luna-copy',
        generateBundle() {
            const { sources } = options;

            sources.forEach(source => {
                const { input, output } = source;

                const basePath = input.replace(`**\\*`, '**/*').split("**/*")[0];

                const files = glob.sync(input);

                files.forEach(file => {
                    const target = path.join(
                        output,
                        getPathRelativeToBasePath(file, basePath)
                    );

                    if (fs.lstatSync(file).isDirectory()) {
                        fs.mkdirSync(target, { recursive: true });
                        return;
                    }

                    if (!fs.existsSync(path.dirname(target))) {
                        fs.mkdirSync(path.dirname(target), { recursive: true });
                    }

                    fs.copyFileSync(file, target);
                })
            });
        },
    }
}
