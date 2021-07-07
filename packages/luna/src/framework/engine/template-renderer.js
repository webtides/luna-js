import {LunaService} from "../../decorators/service";

@LunaService({
    name: 'TemplateRenderer'
})
class TemplateRenderer {
    renderToString(template) {
        return template;
    }
}

export default TemplateRenderer;
