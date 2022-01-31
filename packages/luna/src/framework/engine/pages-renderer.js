import {Inject, LunaService} from "../../decorators/service";
import ElementRenderer from "./element-renderer";
import ComponentLoader from "../loaders/component-loader";
import LayoutsLoader from "../loaders/layouts-loader";

@LunaService({
    name: 'PagesRenderer'
})
export default class PagesRenderer {
    @Inject(ComponentLoader) componentLoader;
    @Inject(LayoutsLoader) layoutsLoader;
    @Inject(ElementRenderer) elementRenderer;

    /**
     * Takes a page and a layout factory and wraps the pages
     * with the layout.
     *
     * Replaces the ${page} variable inside the layout.
     *
     * @param factory (page) => *   The layout factory which should be used
     * @param page *                The html page fragment.
     * @param context {{}}          The context to be passed into the layout.
     *
     * @returns {Promise<string>}
     */
    async applyLayout(factory, page, context) {
        const factoryResult = await factory(page, context);
        return `${factoryResult}`;
    }

    /**
     * Loads the content of an anonymous page. Anonymous pages cannot be dynamic, so
     * they can be cached.
     *
     * @param module {{layout: *, module: *, page: *, middleware: *}}   The page module loaded by {@link loadPageModule}
     * @param request *     The express request object
     * @param response *    The express response object.
     * @param container ServiceContext
     *
     * @returns {Promise<{markup: string, layoutFactory: *, element: *}|boolean>}
     */
    async renderAnonymousPage({module, request, response, container}) {
        const {page} = module;

        if (typeof page !== 'function') {
            return false;
        }

        const layoutName = module?.module && typeof module.module.layout === 'function'
            ? module.module.layout()
            : 'default';

        const context = module?.module && typeof module.module.context === 'function'
            ? await module.module.context()
            : {};

        return {
            markup: await page({ request, response, container }),
            layout: this.layoutsLoader.getLayoutByName(layoutName),
            context,
        };
    }

    async renderComponentPage({ module, request, response }) {
        // Convert the page module to a component so that we can use the
        // element renderer.
        const componentData = {
            component: {
                element: module.page,
                ElementFactory: module.ElementFactory,
            },
            attributes: {},
            group: 'pages',
            request,
            response,
        };

        const { markup, element } = await this.elementRenderer.renderComponent(componentData);

        const layoutName = element && typeof element.layout === 'function'
            ? element.layout()
            : element?.layout ?? 'default';

        return {
            markup,
            layout: this.layoutsLoader.getLayoutByName(layoutName),
            context: element,
        }
    }

    /**
     * Takes a loaded page module and generates the markup. Checks if the page is an anonymous
     * page or a component page and uses {@link renderAnonymousPage} to
     * generate the markup.
     *
     * @param module {{layout: *, module: *, page: *, middleware: *}}   The page module loaded by {@link loadPageModule}
     * @param request *                                                 The express request object
     * @param response *                                                The express response object.
     * @param container {ServiceContext}
     *
     * @returns {Promise<string|boolean>}   The complete markup as a string.
     */
    async generatePageMarkup({module, request, response, container}) {

        const pageData = { module, request, response, container };

        const result = module.isComponentPage
            ? await this.renderComponentPage(pageData)
            : await this.renderAnonymousPage(pageData);

        if (!result) {
            return false;
        }

        const page = result.markup;

        return this.applyLayout(result.layout, page, result.context);
    }

}
