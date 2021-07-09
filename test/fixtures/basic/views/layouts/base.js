const layout = (page, context = { }) => {
    context.head = [
        `<meta charset="UTF-8" />`,
        `<meta name="viewport" content="width=device-width, initial-scale=1">`
    ].join('');

    return `
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
