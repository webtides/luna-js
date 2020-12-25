import {unsafeHTML} from "@popeindustries/lit-html-server/directives/unsafe-html.js";

const template = ({ html, context }) => {
    return html`
        <!doctype html>
        <html lang="">
            <head>
                <title>${context.title ?? ""}</title>
            </head>
            <body>
                ${unsafeHTML(context.page ?? "")}
                
                <element-scripts></element-scripts>
            </body>
        </html>
    `;
};

export default template;
