import {LunaService} from "../../decorators/service";

@LunaService({
    name: 'TemplateRenderer'
})
export default class TemplateRenderer {
    async render(template) {
        const { render } = await import('@webtides/luna-render');
        return render(template);
    }
}
