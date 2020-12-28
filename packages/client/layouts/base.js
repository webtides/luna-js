const scripts = ({ html }) => {
    return html`
        <script src="/libraries/webcomponents-bundle.js" nomodule></script>
        <script src="/assets/bundle.legacy.js" nomodule></script>
    `;
}

const template = ({ html, context }) => {
    return html`
        <!doctype html>
        <html lang="">
            <head>
                <title>${context.title ?? ""}</title>
                ${context.head ?? ""}
            </head>
            <body>
                ${context.page ?? ""}

                ${context.footer ?? ""}
                
                ${scripts({ html })}
            </body>
        </html>
    `;
};

export {
    scripts
}

export default template;
