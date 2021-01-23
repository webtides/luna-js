# moon-js

## Static Site Generation & SSR framework for custom-elements.

### Why?

The idea behind `moon-js` is to allow developers to rapidly create a full fledged
 web application using custom-elements with support for server side rendering.  
Under the hood it uses [@webtides/element-js](https://github.com/webtides/element-js).

## Installation

moon.js should be installed as a npm dependency. To install the module
add the following line to your dependencies and run `npm install`  
`"@webtides/moon-js": "git@github.com:webtides/moon-js.git"`.

## Getting started

`moon-js` ships with a command line tool. After installing `moon-js` as a dependency, you can simply run `moon --dev`
to start your application in development mode. If this is the first time you have started `moon-js`, you will be asked 
if `moon-js` should generate a config-file and a basic directory structure for you. 

## element-js concepts

You can read all about `element-js` here: [@webtides/element-js](https://github.com/webtides/element-js).

## moon-js concepts

`moon-js` uses the directory structure to automatically load the building blocks of your application.

### Configuration

`moon-js` uses a central configuration file at the root of your project to make itself familiar with your project
structure. The file is called `moon.config.js` and will be generated automatically the first time you run the `moon-js` 
cli.

### Pages & Routes

By creating a file in your configured `Pages Directory`, you can register a new route. The name of the fill will be 
the name of the route.

If your `Pages Directory` is `app/pages` and you create a new file `home.js`, the route that is being registered
is `/home`.  
If you create a page inside a subdirectory, for example in `admin/dashboard.js`, the route that is being registered
is `/admin/dashboard`.  

To register the  `/`-route, the name of your file should be `index.js`.

*Example of a `moon-js` route:*
```js
// index.js
import { html } from "@webtides/moon-js";

export default () => {
    return html`
        <h1>Welcome to moon-js</h1>
    `;
});
```

### Layouts

Your can define a layout, which the page should extend. In a layout you can define which stylesheets or external
scripts should be loaded.

You need to make sure that you allow the page content to be rendered, by specifiying `context.page` and the 
scripts which are generated by `moon-js`.

*Example of a custom layout file:*
```js
import { scripts } from "@webtides/moon-js/lib/packages/client/layouts/base";
import { html } from "@webtides/moon-js";

const layout = ({ context }) => {
    return html`
        <!doctype>
        <html>
            <head>
                <title></title>
            </head>
            <body>
                ${context.page}
                
                ${scripts({ html })}
            </body>
        </html>
    `;
};

export { layout };
```

*Example of a layout which extends the base layout provided by `moon-js`:*
```js
import { layouts, html } from "@webtides/moon-js";

const layout = ({ context }) => {

    context.head = [
        html`<link href="/assets/css/main.css" type="text/css" rel="stylesheet" />`,
        html`<meta name="viewport" content="width=device-width, initial-scale=1">`
    ];

    return layouts.base({ html, context });
};

export { layout };
```

### Using a layout

If you want to use a different layout than the default one, you have to specifiy it in your pages.
To do this, simply define a named `layout` export.

```js
import { html } from "@webtides/moon-js";
export { layout } from "../layouts/base";

export default (() => {
    return html`
        <h1>Welcome to moon-js</h1>
    `;
});
```

### APIs

Api routes can be created the same way as page routes. To register an api route, just create 
a file inside your `Api Directory`.

All api routes will be prefixed with `api`. If you create a `users.js` inside the root of your `Api directory`
the final url will be `/api/users`.

#### Get request

Example of a basic route which will react on a get request.
```js
export default async ({ request, response }) => {
    return response.json({ result: "success" });
}
```
#### Post request
Example of a basic route which will react on a post request.
```js
const post = async ({ request, response }) => {
    return response.json({ result: "success" });
};

export { post };
```

#### Mixed requests

```js
const post = async ({ request, response }) => {
    return response.json({ result: "get success" });
};

const get = async ({ request, response }) => {
    return response.json({ result: "post success" });
};

export { post, get };
```

### Hooks

To extend functionality and to react on certain events, `moon-js` introduces a hook system. You have
multiple of hooks available. To register a hook, create a file in your `Hooks Directory`.


## Static site generator

Using `moon-js` as a static site generator is possible, too. 
The following command exports you complete application as a static site:
```
moon --export
```

Before you can export your site, you have to set you `outputDirectory` inside
your `moon.config.js`.

```
{
    ...,
    export: {
        outputDirectory: ".export"    
    },
    ...
}
```

### Gotchas

The `loadDynamicProperties` method cannot be called in a static context. If you export
your application as a static site this method will be ignored.


## Api generator

`moon-js` also allows you to export your api routes as a standalone express
application. This is useful for serverless environments or if you generated
your static site, but don't want to loose all your serverside functionality.

To generate an api server, you can use the follwing command:

```
moon --export --api
```
Before you can export your api, you have to set your `apiOutputDirectory` inside
your `moon.config.js`. If `apiOutputDirectory` is not set, `moon-js` will fall back
to `outputDirectory`.

```
{
    ...,
    export: {
        outputDirectory: ".export",
        apiOutputDirectory: ".api"
    },
    ...
}
```
