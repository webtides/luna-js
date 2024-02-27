import { Readable } from 'stream';
import { render } from '@lit-labs/ssr/lib/render-with-global-dom-shim.js';

const streamToString = (stream) => {
    const chunks = [];
    return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        stream.on('error', (err) => reject(err));
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    })
};

export default class TemplateRenderer {
    async renderToString(template) {
        // We need a dynamic import here, because we need to force rollup to
        // import the render function after loading the additional imports defined
        // in this renderer.
        const stream = Readable.from(render(await template, { elementRenderers: [ ], customElementHostStack: [], customElementInstanceStack: [] }));
        const result = await streamToString(stream);

        // Match the default behaviour of lit and render the result inside the shadow dom.
        return `<template shadowroot="open">${result}</template>`;
    }
}
