# moon.js 
> SSR framework for custom elements.


## Installation

moon.js should be installed as a npm dependency. To install the module
just run `npm install --save moon.js`

## Usage

The framework can be used without much configuration needed. To get started
you have to follow these steps:


  -  Create a `moon.config.js` file next to your `package.json` with the following
contents.
```
module.exports = {
    buildDirectory: ".build",
    assetsDirectory: ".build/public/assets",

    pagesDirectory: "app/pages/**/*.js",
    componentsDirectory: "app/components/**/*.js"
}
```

  - To build your server and client bundles, moon.js ships with two different
rollup configurations. `rollup.config.components.js` and `rollup.config.client.js`.  
You could add the build steps to your `package.json`

```
    "server-components": "rollup --config node_modules/moon.js/rollup.config.components.js",
    "client-components": "rollup --config node_modules/moon.js/rollup.config.client.js"
```
