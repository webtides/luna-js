import {getSerializableConfig, getSettings, getManifest} from "../config";

import posthtml from 'posthtml';
import posthtmlInsertAt from 'posthtml-insert-at';

import {Inject} from "../../decorators/service";
import ComponentLoader from "../loaders/component-loader";
import ElementRenderer from "./element-renderer";

import ssr from './plugins/posthtml-plugin-custom-elements';

export default class DocumentRenderer {
    @Inject(ComponentLoader) componentLoader;
    @Inject(ElementRenderer) elementRenderer;

    upgradedElements = {};

    constructor({ request, response }) {
        this.request = request;
        this.response = response;
    }

    async addDependenciesToUpgradedElements(dependencies) {
        dependencies = [ dependencies ].flat();

        for (const dependency of dependencies) {
            if (!this.upgradedElements[dependency]) {
                const component = await this.componentLoader.loadSingleComponentByTagName(dependency);

                if (!component) {
                    continue;
                }

                const element = new (component.element)();

                const children = component.children;
                if (typeof element.dependencies === "function") {
                    children.push(...element.dependencies());
                }

                await this.addDependenciesToUpgradedElements(children);

                this.upgradedElements[dependency] = component;
            }
        }
    }

    /**
     * Takes a html-node and tries to match it with a custom element.
     * Recursively renders & upgrades all child elements.
     *
     * @param node
     *
     * @returns {Promise<boolean|{component: ({file: string, relativePath: string, name: *, element: *}|boolean), innerHTML: (jQuery|string), attributes: (*|{})}>}
     */
    async onCustomElementDomNode(node) {
        const { tag } = node;
        const component = await this.componentLoader.loadSingleComponentByTagName(tag);

        if (!component) {
            return false;
        }

        if (typeof component.element.loadStaticProperties === "undefined" || component.element.disableSSR) {
            return {
                component,
                noSSR: true,
                dependencies: []
            }
        }

        node.attrs = node.attrs ?? {};

        const attributes = {};
        for (const rawAttributeName of Object.keys(node.attrs)) {
            const attributeName = rawAttributeName.startsWith('.')
                ? rawAttributeName.substring(1)
                : rawAttributeName;

            delete attributes[rawAttributeName];
            attributes[attributeName] = node.attrs[rawAttributeName];
        }

        node.attrs = {
            ssr: true,
            ...attributes
        };

        const {markup, element, dependencies} = await this.elementRenderer.renderComponent({
            component,
            attributes: node.attrs,
            request: this.request,
            response: this.response,
        });

        node.content = markup;

        const innerDocument = await this.renderUsingPostHtml(markup, true);

        return {
            attributes: node.attrs,
            component,
            dependencies,
            innerHTML: !element._options.shadowRender ? innerDocument : ""
        };
    };

    parseUpgradedElements() {
        const settings = getSettings();
        const manifest = getManifest("manifest.client.json");
        const config = JSON.stringify(getSerializableConfig());

        const modules = `
            <script type="module">
                ${Object.keys(this.upgradedElements)
                    .filter(key => !this.upgradedElements[key]?.element?.disableCSR)
                    .map(key => {
                        const component = this.upgradedElements[key];
                        const importPath = luna.asset(`${component.outputDirectory}/${manifest[component.relativePath]}`);
    
                        return `
                            import ${component.name} from "${importPath}";
                            customElements.define("${component.tagName}", ${component.name});
                        `;
                    })
                    .join("\n")
                }
            </script>`;

        const scripts = `
            ${settings.build.legacy ? `
                <script src="${luna.asset("/libraries/webcomponents-bundle.js")}" nomodule></script>
                <script src="${luna.asset("/libraries/runtime.js")}" nomodule></script>
                <script src="${luna.asset("/assets/bundle.legacy.js")}" nomodule></script>
            ` : ``}
        
            <script type="text/javascript">
                window.lunaConfig = JSON.parse('${config}');
            </script>
            <script type="text/javascript" src="${luna.asset('/luna.js')}" />
            
            ${global.lunaCli?.documentInject ?? ``}
        `;

        return [ modules, scripts ].join('');
    }

    /**
     * Takes a whole html document and renders all custom elements
     *
     * @param htmlDocument
     * @returns {Promise<string>}
     */
    async render(htmlDocument) {
        const html = await this.renderUsingPostHtml(htmlDocument);

        return (await posthtml([
            posthtmlInsertAt({
                selector: 'html',
                append: this.parseUpgradedElements(),
            })
        ]).process(html)).html;
    }

    async renderUsingPostHtml(htmlDocument, subroutine = false) {
        const plugins = [
            ssr({
                request: this.request,
                response: this.response,
                onCustomElementDomNode: async (node) => {
                    const {component} = await this.onCustomElementDomNode(node);

                    await this.addDependenciesToUpgradedElements(component.tagName);

                    return component;
                }
            }),
        ];

        return (await posthtml(plugins).process(htmlDocument)).html;
    }
}
