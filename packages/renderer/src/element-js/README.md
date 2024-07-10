# element-js renderer for luna

## Usage

Add the renderer to your `luna.config.js`.

```js
{
    renderers: [
        {
            match: (component) => true,
            renderer: import('@webtides/luna-renderer/src/element-js'),
        }
    ]
}
```
