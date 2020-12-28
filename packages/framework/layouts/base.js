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
                
                <script src="/libraries/webcomponents-bundle.js" nomodule></script>
                <script src="/assets/bundle.legacy.js" nomodule></script>
            </body>
        </html>
    `;
};

export default template;
