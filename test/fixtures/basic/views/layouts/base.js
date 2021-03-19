import { html } from "@webtides/luna-js";

const layout = (page, context = { }) => {
    context.head = [
        html`<meta charset="UTF-8" />`,
        html`<meta name="viewport" content="width=device-width, initial-scale=1">`
    ];

    return html`
        <!doctype html>
        <html lang="">
            <head>
                <title>${context.title ?? ""}</title>
                ${context.head ?? ""}
            </head>
            <body>
                MOCHA LAYOUT
                <main>
                    ${page ?? ""}
                </main>
                
                ${context.text ?? ''}
            </body>
        </html>
    `;
};

export default layout;
