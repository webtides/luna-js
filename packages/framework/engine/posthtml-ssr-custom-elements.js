import posthtml from 'posthtml';

import {html, renderToString} from '@popeindustries/lit-html-server';
import {unsafeHTML} from "@popeindustries/lit-html-server/directives/unsafe-html";
import {loadCustomElements} from "./component-loader.js";
import {paramCase} from "param-case";
import {renderNodeAsCustomElement} from "./element-renderer";

const componentsToInject = {};

export default function postHtmlSSRCustomElements(upgradedElements = { }) {

    const walkTree = (tree, customElements) => {
        return new Promise((resolve) => {
            let tasks = 0;

            tree.walk((node) => {
                if (node.tag && node.tag.includes('-') && customElements[node.tag]) {
                    tasks += 1;

                    // instantiate the element class with the properties and attributes for rendering the template
                    const component = customElements[node.tag];
                    renderNodeAsCustomElement(node, component, upgradedElements)
                        .then(node => {
                            tasks -= 1;
                            done();
                        });
                }

                return node;
            });

            done();

            function done() {
                if (tasks === 0) {
                    resolve({tree, componentsToInject});
                }
            }
        })
    };

    return async function (originalTree) {
        const customElements = await loadCustomElements();
        const { tree, components } = await walkTree(originalTree, customElements);

        tree.match({ tag: 'element-scripts' }, node => {
            node.content = `<script type="module" src="/assets/elements/previous.js"></script>`;
            node.content += `
                <script type="module">
                    ${Object.keys(upgradedElements)
                        .map(key => {
                            const component = upgradedElements[key];
                            const path = component.relativePath.split("/").pop();
                            return `
                                import ${component.name} from "/assets/elements/${path}";
                                customElements.define("${paramCase(component.name)}", ${component.name});
                            `;
                        })
                        .join("\n")
                    } 
                </script>
            `;

            return node;
        });
    }
};
