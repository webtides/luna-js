import {LunaService} from "../../decorators/service";

@LunaService({
    name: 'Renderer'
})
export default class Renderer {
    /**
     *
     * @param template
     * @param renderInfo
     *
     * @returns {Promise<Generator<any|string|*|any|any, void, any>>}
     */
    async render(template, renderInfo) {
        const { render } = (await import('@webtides/luna-renderer/lib/server.js'));
        return render(template, renderInfo);
    }
}
