import {render} from '@lit-labs/ssr/lib/render-with-global-dom-shim.js';
import {ElementRenderer} from "@lit-labs/ssr/lib/element-renderer.js";
import { renderLight } from "@lit-labs/ssr-client/directives/render-light.js";

import { html } from 'lit-html';
import { unsafeHTML } from "lit-html/directives/unsafe-html.js";
import { guard } from "lit-html/directives/guard.js";
import { until } from "lit-html/directives/until.js";

// const streamToString = (stream) => {
//     const chunks = [];
//     return new Promise((resolve, reject) => {
//         stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
//         stream.on('error', (err) => reject(err));
//         stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
//     })
// };
//
// const render = (template) => {
//     const stream = Readable.from(renderStream(template, { elementRenderers: [ LunaElementRenderer ], customElementHostStack: [], customElementInstanceStack: [] }));
//     return streamToString(stream);
// };

export default { html, render, unsafeHTML, guard, until, renderLight, ElementRenderer }
