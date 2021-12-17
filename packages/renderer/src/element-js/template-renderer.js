import {renderToString} from "@popeindustries/lit-html-server";
export default class TemplateRenderer {
    async renderToString(template) {
        return renderToString(template, {
            serializePropertyAttributes: true,
        });
    }
}
