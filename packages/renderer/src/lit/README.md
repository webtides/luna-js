# Lit element renderer for luna

## Usage

Add the renderer to your `luna.config.js`.

```js
{
    renderers: [
        {
            match: (component) => true,
            renderer: require('@webtides/luna-renderer/lib/lit'),
        }
    ]
}
```

## Known limitations

- Currently there seems to be a bug in lit, where decorators are not supported in the legacy mode of
  babel. (https://github.com/lit/lit-element/issues/205) This means you cannot use the decorator feature of lit but you
  need to use the alternative implementation

- No support for `Component.TARGET_BOTH` for `LitElement`s. The content will be duplicated if activated.

- We are not using the lit ssr renderer to render the whole document, but to render single elements. This is probably
  not the intended behaviour and will be updated in the future.
