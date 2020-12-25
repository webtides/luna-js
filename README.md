# element-js-ssr-example

## Requirements

* Node >="v14.13.0"

Because we need to use and load the same ES modules in the browser and in Node.

## Stack
* express
* posthtml
* lit-html-server
* @webtides/element-js
* @webtides/tasks

## Getting started

```
npm install
npm start
```

It will start a node server on http://localhost:3001 and watch for changes in the /src directory and re-compile everything and update the server.

## TODOs

- [x] Render element-js light DOM templates server side
- [ ] Add style blocks when rendering server side
- [ ] Try rendering shadow DOM server side: https://web.dev/declarative-shadow-dom/ 
