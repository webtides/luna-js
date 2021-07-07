import {LunaService} from "@webtides/luna-js";
import BaseTemplateRenderer from "@webtides/luna-js/src/framework/engine/template-renderer";

import {renderToString} from "@popeindustries/lit-html-server";

@LunaService({
    as: BaseTemplateRenderer,
})
export default class TemplateRenderer {
    async renderToString(template) {
        return renderToString(template, {
            serializePropertyAttributes: true,
        });
    }
}
