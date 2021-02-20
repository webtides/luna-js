import { html } from '@popeindustries/lit-html-server';

const scripts = ({ html }) => {
    return html`
        <script src="/libraries/webcomponents-bundle.js" nomodule></script>
        <script src="/libraries/runtime.js" nomodule></script>
        <script src="/assets/bundle.legacy.js" nomodule></script>
    `;
}

const template = (page, context = {}) => {
    return html`
        <!doctype html>
        <html lang="">
            <head>
                <title>${context.title ?? ""}</title>
                ${context.head ?? ""}
            </head>
            <body>
                ${page ?? ""}

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
