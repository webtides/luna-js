import { html } from '@popeindustries/lit-html-server';

const template = (page, context = {}) => {
    return html`
        <!doctype html>
        <html lang="${context.lang ?? "de"}">
            <head>
                <title>${context.title ?? ""}</title>
                ${context.head ?? ""}
            </head>
            <body>
                ${page ?? ""}

                ${context.footer ?? ""}
            </body>
        </html>
    `;
};

export default template;
