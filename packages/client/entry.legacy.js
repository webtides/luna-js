import path from "path";

const settings = require(path.join(process.cwd(), "moon.config.js"));
const componentsDirectory = path.join(process.cwd(), settings.componentsDirectory);


const files = require.context(componentsDirectory, true, /\.vue$/i)
files.keys().map(key => {
    console.log(key);
});
