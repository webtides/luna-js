import { html } from '../../renderer';

/**
 * @deprecated Legacy scripts are now automatically injected by the document-renderer.
 * @returns {TemplateResult}
 */
const scripts = () => { return html``; }

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

export {
    scripts
}

export default template;
