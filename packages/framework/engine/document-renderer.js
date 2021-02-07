import cheerio from "cheerio";
import {loadSingleComponentByTagName} from "../loaders/component-loader";
import { loadSettings } from "../config";
import {renderComponent} from "./element-renderer";
import {paramCase} from "param-case";

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
 * Takes a cheerio-node and tries to match it with a custom element.
 * Recursively renders & upgrades all child elements.
 *
 * @param node Node
 * @param upgradedElements *
 * @param {*}
 *
 * @returns {Promise<boolean|{component: ({file: string, relativePath: string, name: *, element: *}|boolean), innerHTML: (jQuery|string), attributes: (*|{})}>}
 */
const renderNodeAsCustomElement = async (node, upgradedElements, {request, response}) => {
    const tag = node.tagName;
    const component = await loadSingleComponentByTagName(tag);

    if (!component) {
        return false;
    }

    if (typeof component.element.loadStaticProperties === "undefined" || component.element.disableSSR) {
        return {
            component,
            noSSR: true
        }
    }

    const attributes = Object.assign({}, node.attribs) || {};

    const {markup, element, dependencies} = await renderComponent({component, attributes, request, response});

    const innerDocument = await parseHtmlDocument(cheerio.load(markup, null, false), upgradedElements, {
        request,
        response
    });

    return {
        attributes,
        component,
        dependencies,
        innerHTML: !element._options.shadowRender ? innerDocument.html() : ""
    };
};

/**
 * Takes a cheerio object and tries to renders all available custom elements.
 *
 * @param $
 * @param upgradedElements
 * @param {*}
 *
 * @returns {Promise<jQuery|HTMLElement>}
 */
const parseHtmlDocument = async ($, upgradedElements, {request, response}) => {
    await Promise.all($("*").map(async (index, node) => {
        if (node.tagName.includes("-")) {
            // This is potentially a custom element.
            const result = await renderNodeAsCustomElement(node, upgradedElements, {request, response});

            if (!result) {
                return;
            }

            if (result.noSSR) {
                upgradedElements[node.tagName] = result.component;
                return;
            }

            const {component, attributes, innerHTML, dependencies} = result;

            await addDependenciesToUpgradedElements([...component.children, ...dependencies ], upgradedElements);

            const $node = $(node);
            $node.html(innerHTML);

            attributes && Object.keys(attributes).forEach(key => $node.attr(key, attributes[key]));

            upgradedElements[node.tagName] = component;
        }
    }));

    return $;
};

const appendUpgradedElementsToDocument = async ($, upgradedElements) => {
    const settings = await loadSettings();

    $("body")
        .append(`
            <script type="module">
                ${Object.keys(upgradedElements)
                    .filter(key => !upgradedElements[key].element.disableCSR)
                    .map(key => {
                        const component = upgradedElements[key];
                        const relativePath = component.outputDirectory.substring(settings.publicDirectory.length);
                        const componentPath = component.relativePath.split("/").pop();
        
                        return `
                            import ${component.name} from "${relativePath}/${componentPath}";
                            customElements.define("${paramCase(component.name)}", ${component.name});
                        `;
                    })
                    .join("\n")
                }
            </script>
        `);
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
    const $ = cheerio.load(htmlDocument, null, true);

    const upgradedElements = {};
    await parseHtmlDocument($, upgradedElements, {request, response});

    await appendUpgradedElementsToDocument($, upgradedElements);

    return $.html();
};

