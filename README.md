# luna-js

## Static Site Generation & SSR framework for custom-elements.

### Why?

The idea behind `luna-js` is to allow developers to rapidly create a full fledged
 web application using custom-elements with support for server side rendering.  
Under the hood it uses [@webtides/element-js](https://github.com/webtides/element-js), which is based
on the WebComponents standard.

## Installation

luna-js should be installed as a npm dependency. To install luna-js run
 
 `npm install @webtides/luna-js --save`

To get started with development, you should install the luna cli as a development
dependency as well:

`npm install @webtides/luna-cli --save-dev`

## Getting started

 After installing `luna-js` and the `luna-cli` as a dependency, you can simply run `luna --dev`
to start your application in development mode. If this is the first time you have started `luna-js`, you will be asked
if `luna-js` should generate a config-file and a basic directory structure for you.

## element-js concepts

You can read all about `element-js` here: [@webtides/element-js](https://github.com/webtides/element-js).

## luna-js concepts

`luna-js` uses the directory structure to automatically load the building blocks of your application.

## Complete documentation

The complete documentation can be found under: [https://docs.lunajs.dev/](https://docs.lunajs.dev/)

## License

MIT License
