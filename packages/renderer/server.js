import { Readable } from 'stream';
import {render as renderStream} from '@lit-labs/ssr/lib/render-lit-html.js';

import { html } from 'lit-html';
import { unsafeHTML } from "lit-html/directives/unsafe-html.js";
import { guard } from "lit-html/directives/guard.js";
import { until } from "lit-html/directives/until.js";

const streamToString = (stream) => {
    const chunks = [];
    return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        stream.on('error', (err) => reject(err));
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    })
};

const render = (template) => {
    const stream = Readable.from(renderStream(template));
    return streamToString(stream);
};

export default { html, render, unsafeHTML, guard, until }
