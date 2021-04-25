import { Readable } from 'stream';
import {loadManifest, loadSettings, getSerializableConfig} from "../config";
import {paramCase} from "param-case";

import {Inject, LunaService} from "../../decorators/service";
import ComponentLoader from "../loaders/component-loader";
import ElementRenderer from "./element-renderer";
import Renderer from "./renderer";
import {renderLight} from "@webtides/luna-renderer/lib/server.js";

@LunaService({
    name: 'DocumentRenderer'
})
export default class DocumentRenderer {
    @Inject(ComponentLoader) componentLoader;
    @Inject(ElementRenderer) elementRenderer;

    @Inject(Renderer) renderer;

    async addDependenciesToUpgradedElements(dependencies, upgradedElements) {
        dependencies = [ dependencies ].flat();

        for (const dependency of dependencies) {
            if (!upgradedElements[dependency]) {
                const component = await this.componentLoader.loadSingleComponentByTagName(dependency);

                if (!component) {
                    continue;
                }

                const element = new (component.element)();

                const children = component.children;
                if (typeof element.dependencies === "function") {
                    children.push(...element.dependencies());
                }

                await this.addDependenciesToUpgradedElements(children, upgradedElements);

                upgradedElements[dependency] = component;
            }
        }
    }

    /**
     * Takes a html-node and tries to match it with a custom element.
     * Recursively renders & upgrades all child elements.
     *
     * @param $node
     * @param upgradedElements *
     * @param {*}
     *
     * @returns {Promise<boolean|{component: ({file: string, relativePath: string, name: *, element: *}|boolean), innerHTML: (jQuery|string), attributes: (*|{})}>}
     */
    async renderNodeAsCustomElement($node, upgradedElements, {request, response}) {
        const tag = $node.tagName.toLowerCase();
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

        const attributes = {};
        for (const attribute of $node.attributes) {
            const attributeValue = $node.getAttribute(attribute.name);
            if (attributeValue) {
                attributes[attribute.name] = attributeValue;
            }
        }

        const {markup, element, dependencies} = await this.elementRenderer.renderComponent({component, attributes, request, response});

        $node.innerHTML = markup;

        // Upgrades all custom elements inside this custom element.
        const innerDocument = await this.parseHtmlDocument($node, upgradedElements, {
            request,
            response
        });

        return {
            attributes,
            component,
            dependencies,
            innerHTML: !element._options.shadowRender ? innerDocument.innerHTML : ""
        };
    }

    /**
     * Takes a html node and tries to renders all available custom elements.
     *
     * @param document
     * @param upgradedElements
     * @param {*}
     *
     * @returns {Promise<*>}
     */
    async parseHtmlDocument(document, upgradedElements, {request, response}) {
        await Promise.all([...document.querySelectorAll("*")].map(async ($node, index) => {
            if ($node.tagName.includes("-")) {
                // This is potentially a custom element.
                const result = await this.renderNodeAsCustomElement($node, upgradedElements, {request, response});

                if (!result) {
                    return;
                }

                const { component, dependencies } = result;

                await this.addDependenciesToUpgradedElements([...component.children, ...dependencies ], upgradedElements);

                if (result.noSSR) {
                    upgradedElements[$node.tagName.toLowerCase()] = result.component;
                    return;
                }

                const {attributes, innerHTML} = result;

                $node.innerHTML = innerHTML;

                attributes && Object.keys(attributes).forEach(key => $node.setAttribute(key, attributes[key]));

                upgradedElements[$node.tagName.toLowerCase()] = component;
            }
        }));

        return document;
    }

    async appendUpgradedElementsToDocument(dom, upgradedElements) {
        const settings = await loadSettings();
        const manifest = await loadManifest("manifest.client.json");

        dom.window.document.querySelector("body")
            .innerHTML += `
                <script type="module">
                    ${Object.keys(upgradedElements)
                    .filter(key => !upgradedElements[key].element.disableCSR)
                    .map(key => {
                        const component = upgradedElements[key];
        
                        const importPath = luna.asset(`${component.outputDirectory}/${manifest[component.relativePath]}`);
        
                        return `
                            import ${component.name} from "${importPath}";
                            customElements.define("${paramCase(component.name)}", ${component.name});
                        `;
                    })
                    .join("\n")
                }
                </script>
        `;

        if (settings.build.legacy) {
            dom.window.document.querySelector("body")
                .innerHTML += `
                    <script src="${luna.asset("/libraries/webcomponents-bundle.js")}" nomodule></script>
                    <script src="${luna.asset("/libraries/runtime.js")}" nomodule></script>
                    <script src="${luna.asset("/assets/bundle.legacy.js")}" nomodule></script>
                `;
        }

        const config = JSON.stringify(getSerializableConfig());

        dom.window.document.querySelector("body")
            .innerHTML += `
                <script type="text/javascript">
                    window.lunaConfig = JSON.parse('${config}');
                </script>
                <script type="text/javascript" src="${luna.asset('/luna.js')}" />
            `;

        // TODO: find some kind of plugin system to "connect" the cli and luna
        if (global.lunaCli?.documentInject) {
            dom.window.document.querySelector("body")
                .innerHTML += global.lunaCli.documentInject;
        }
    };

    /**
     * Takes a whole html document and renders all custom elements
     *
     * @param htmlDocument
     * @param request
     * @param response
     * @returns {Promise<Readable>}
     */
    async render(htmlDocument, {request, response}) {
        const { createElementRenderer } = await import('../engine/luna-element-renderer.js');
        const LunaElementRenderer = createElementRenderer({ request, response });

        return Readable.from(await this.renderer.render(htmlDocument, {
            elementRenderers: [ LunaElementRenderer ], customElementHostStack: [], customElementInstanceStack: []
        }));
    }
}
