# element-js renderer for luna

## Usage

Add the renderer to your `luna.config.js`.

```js
{
    renderers: [
        {
            match: (component) => true,
            renderer: require('@webtides/luna-renderer/lib/element-js'),
        }
    ]
}
```

## Known limitations
 
- There is no client side hydration. On first render, the element overrides the
  current html content.
