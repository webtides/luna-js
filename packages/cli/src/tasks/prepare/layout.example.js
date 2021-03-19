import { html } from "@webtides/luna-js";

const layout = (page, context = { }) => {
    const now = Date.now();

    context.head = [
        html`<meta charset="UTF-8" />`,
        html`<link href="/assets/css/main.css?${now}" type="text/css" rel="stylesheet" />`,
        html`<link href="/assets/css/base.css?${now}" type="text/css" rel="stylesheet" />`,
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
                <header>
                    
                </header>
                <main>
                    ${page ?? ""}
                </main>
            </body>
        </html>
    `;
};

export default layout;
