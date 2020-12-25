import posthtml from 'posthtml';

import {html, renderToString} from '@popeindustries/lit-html-server';
import {unsafeHTML} from "@popeindustries/lit-html-server/directives/unsafe-html";
import {loadComponents} from "./component-loader.js";
import {paramCase} from "param-case";

const componentsToInject = {};

function postHtmlSSRCustomElements(options) {
    options = options || {};

    return function (tree) {
        return loadComponents()
            .then(components => {

                return new Promise((resolve) => {
                    let tasks = 0;

                    tree.walk((node) => {
                        if (node.tag && node.tag.includes('-') && components[node.tag]) {
                            tasks += 1;

                            // instantiate the element class with the properties and attributes for rendering the template
                            const element = new (components[node.tag].element)();
                            element.defineProperties({
                                ...element.properties(),
                                ...node.attrs,
                            });

                            componentsToInject[node.tag] = (components[node.tag]);

                            renderToString(element.template({ html })).then(markup => {
                                posthtml()
                                    .use(postHtmlSSRCustomElements())
                                    .process(markup, {}).then(result => {
                                        node.content = result.tree;
                                        tasks -= 1;
                                        done();
                                    });
                            });
                        }
                        return node;
                    })
                    done();

                    function done() {
                        if (tasks === 0) resolve(tree, componentsToInject);
                    }
                })
            })
            .then((tree, components) => {
                tree.match({ tag: 'element-scripts' }, node => {
                    node.content = `<script type="module" src="/assets/elements/previous.js"></script>`;
                    node.content += `
                        <script type="module">
                            ${Object.keys(componentsToInject)
                                .map(key => {
                                    const component = componentsToInject[key];
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
            })
    }
};

export default postHtmlSSRCustomElements;
