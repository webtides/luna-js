import {LunaService} from "../../decorators/service";

@LunaService({
    name: 'Renderer'
})
export default class Renderer {
    async render(template) {
        const { render } = (await import('@webtides/luna-renderer/lib/server.js'));
        return render(template);
    }
}
