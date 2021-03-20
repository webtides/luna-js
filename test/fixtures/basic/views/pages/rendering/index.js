import {html} from "@webtides/luna-js";

export default async () => {
    return html`
        <example-component></example-component>
        <no-ssr-component></no-ssr-component>
    `;
};
