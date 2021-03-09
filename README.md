# moon-js

## Static Site Generation & SSR framework for custom-elements.

### Why?

The idea behind `moon-js` is to allow developers to rapidly create a full fledged
 web application using custom-elements with support for server side rendering.  
Under the hood it uses [@webtides/element-js](https://github.com/webtides/element-js), which is based
on the WebComponents standard.

## Installation

moon-js should be installed as a npm dependency. To install moon-js run
 
 `npm install @webtides/moon-js --save`

To get started with development, you should install the moon cli as a development
dependency as well:

`npm install @webtides/moon-cli --save-dev`

## Getting started

 After installing `moon-js` and the `moon-cli` as a dependency, you can simply run `moon --dev`
to start your application in development mode. If this is the first time you have started `moon-js`, you will be asked 
if `moon-js` should generate a config-file and a basic directory structure for you. 

## element-js concepts

You can read all about `element-js` here: [@webtides/element-js](https://github.com/webtides/element-js).

## moon-js concepts

`moon-js` uses the directory structure to automatically load the building blocks of your application.

## Complete documentation

The complete documentation can be found under: [https://docs.moonjs.dev/](https://docs.moonjs.dev/)

## License

MIT License
