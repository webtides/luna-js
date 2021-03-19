import { html } from "@webtides/luna-js";
import factory from "../layouts/base.js"

const layout = async page => {
    return factory(page, {
        title: "Welcome"
    })
};

export { layout }

export default () => {
    return html`
        <h1>Welcome to luna-js</h1>
    `;
};
