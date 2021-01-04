# moon.js 
> SSR framework for custom elements.


## Installation

moon.js should be installed as a npm dependency. To install the module
just run `npm install --save moon.js`

## Features

### Pages & Routes

To register a route, just create a file in your `Pages Directory` ending with `.page.js`. Moon.js 
will auomatically register the page as a route.

### Layouts

Your can define a layout, which the page should extend.

### APIs

Api routes can be created the same way as pages. To register an api route, just create 
a file inside your `Api Directory`.

### Hooks

To extend functionality and to react on certain events, moon.js introduces a hook system. You have
multiple of hooks available. To register a hook, create a file in your `Hooks Directory`.


## Usage

The framework can be used without much configuration needed. To get started
you have to follow these steps:


  -  Create a `moon.config.js` file next to your `package.json`. Exemplary conents
  can be found inside `moon.config.example.js`.
  
  - To start your server in development mode and build all assets, run:
  `gulp dev --gulpfile node_modules/moon.js/gulpfile.js --cwd .`
