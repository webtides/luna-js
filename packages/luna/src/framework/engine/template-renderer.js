import {renderToString} from "@popeindustries/lit-html-server";
import {LunaService} from "../../decorators/service";

@LunaService({
    name: 'TemplateRenderer'
})
class TemplateRenderer {
    async renderToString(template) {
        return renderToString(template, {
            serializePropertyAttributes: true,
        });
    }
}

export default TemplateRenderer;
