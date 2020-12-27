import {loadCustomElements} from "./component-loader.js";
import {paramCase} from "param-case";
import {renderNodeAsCustomElement} from "./element-renderer";

export default function postHtmlSSRCustomElements(upgradedElements = { }) {

    const walkTree = async (tree, customElements) => {
        const renderingPromises = [];

        tree.walk((node) => {
            if (node.tag && node.tag.includes('-') && customElements[node.tag]) {
                // instantiate the element class with the properties and attributes for rendering the template
                const component = customElements[node.tag];
                renderingPromises.push(renderNodeAsCustomElement(node, component, upgradedElements));
            }
            return node;
        });

        await Promise.all(renderingPromises);

        return { tree };
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
