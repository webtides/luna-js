import {html} from "@webtides/luna-js";

const middleware = [
    (request, response, next) => {
        response.set('luna-middleware', 'works');
        next();
    }
];

export { middleware };

export default async () => {
    return html``;
}
