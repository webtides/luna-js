import {html, renderToString} from "@popeindustries/lit-html-server";
import posthtml from "posthtml";
import postHtmlSSRCustomElements from "./posthtml-ssr-custom-elements";

const renderNodeAsCustomElement = async (node, component, upgradedElements = { }) => {
    const element = new (component.element)();
    element.defineProperties({
        ...element.properties(),
        ...node.attrs,
    });

    const attributes = node.attrs ?? {};
    attributes["ssr"] = true;

    node.attrs = attributes;

    upgradedElements[node.tag] = component;

    if (!element._options.shadowRender) {
        const markup = await renderToString(element.template({html}))
        const result = await posthtml()
            .use(postHtmlSSRCustomElements(upgradedElements))
            .process(markup, {});

        node.content = result.tree;
    }

    return node;
};

export { renderNodeAsCustomElement };
