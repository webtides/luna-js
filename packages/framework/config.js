import path from "path";

const loadSettings = async () => {
    return (await import(path.join(process.cwd(), "moon.config.js"))).default;
};

export { loadSettings };

export default (() => {
    return {
        baseDirectory: ".",
        frameworkDirectory: "./.build/packages/framework",
        pagesDirectory: "./.build/pages",
        apiDirectory: "./.build/api",
        componentsDirectory: "./.build/components",
        layoutsDirectory: "./.build/layouts"
    }
})();
