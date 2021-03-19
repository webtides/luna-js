import {loadSingleComponentByTagName} from "../loaders/component-loader";
import {loadManifest, loadSettings, getSerializableConfig} from "../config";
import {renderComponent} from "./element-renderer";
import {paramCase} from "param-case";

import { JSDOM } from "jsdom";

const addDependenciesToUpgradedElements = async (dependencies, upgradedElements) => {
    dependencies = [ dependencies ].flat();

    for (const dependency of dependencies) {
        if (!upgradedElements[dependency]) {
            const component = await loadSingleComponentByTagName(dependency);

            if (!component) {
                continue;
            }

            const element = new (component.element)();

            const children = component.children;
            if (typeof element.dependencies === "function") {
                children.push(...element.dependencies());
            }

            await addDependenciesToUpgradedElements(children, upgradedElements);

            upgradedElements[dependency] = component;
        }
    }
};

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
const renderNodeAsCustomElement = async ($node, upgradedElements, {request, response}) => {
    const tag = $node.tagName.toLowerCase();
    const component = await loadSingleComponentByTagName(tag);

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

    const {markup, element, dependencies} = await renderComponent({component, attributes, request, response});

    $node.innerHTML = markup;

    // Upgrades all custom elements inside this custom element.
    const innerDocument = await parseHtmlDocument($node, upgradedElements, {
        request,
        response
    });

    return {
        attributes,
        component,
        dependencies,
        innerHTML: !element._options.shadowRender ? innerDocument.innerHTML : ""
    };
};

/**
 * Takes a html node and tries to renders all available custom elements.
 *
 * @param document
 * @param upgradedElements
 * @param {*}
 *
 * @returns {Promise<*>}
 */
const parseHtmlDocument = async (document, upgradedElements, {request, response}) => {
    await Promise.all([...document.querySelectorAll("*")].map(async ($node, index) => {
        if ($node.tagName.includes("-")) {
            // This is potentially a custom element.
            const result = await renderNodeAsCustomElement($node, upgradedElements, {request, response});

            if (!result) {
                return;
            }

            const { component, dependencies } = result;

            await addDependenciesToUpgradedElements([...component.children, ...dependencies ], upgradedElements);

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
};

const appendUpgradedElementsToDocument = async (dom, upgradedElements) => {
    const settings = await loadSettings();
    const manifest = await loadManifest("manifest.client.json");

    dom.window.document.querySelector("body")
        .innerHTML += `
            <script type="module">
                ${Object.keys(upgradedElements)
                    .filter(key => !upgradedElements[key].element.disableCSR)
                    .map(key => {
                        const component = upgradedElements[key];
                        
                        const relativePath = component.outputDirectory.substring(settings.publicDirectory.length);
                        
                        const manifestKey = "/" + component.directory + component.relativePath;
                        const importPath = luna.asset(`${relativePath}/${manifest[manifestKey]}`);
                        
                        return `
                            import ${component.name} from "${importPath}";
                            customElements.define("${paramCase(component.name)}", ${component.name});
                        `;
                    })
                    .join("\n")
                }
            </script>
        `;

    if (settings.legacyBuild) {
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
};

/**
 * Takes a whole html document and renders all custom elements
 *
 * @param htmlDocument
 * @param request
 * @param response
 * @returns {Promise<string>}
 */
export default async (htmlDocument, {request, response}) => {
    const dom = new JSDOM(htmlDocument);

    const upgradedElements = {};
    await parseHtmlDocument(dom.window.document, upgradedElements, {request, response});

    await appendUpgradedElementsToDocument(dom, upgradedElements);

    return dom.serialize();
};
