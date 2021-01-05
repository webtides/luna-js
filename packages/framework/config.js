import path from "path";

const loadSettings = async () => {
    return (await import(path.join(process.cwd(), "moon.config.js"))).default;
};

export { loadSettings };
