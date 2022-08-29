import TemplateRenderer from "./template-renderer.js";
import ElementFactoryFactory from "../shared/element-factory.js";

const ElementFactory = ElementFactoryFactory(TemplateRenderer);

const stubs = async () => [{
    sources: ['@webtides/element-js/src/renderer/vanilla', '@webtides/element-js/src/renderer/vanilla.js'],
    stub: require.resolve('./stubs/index.js'),
}];

export {ElementFactory, TemplateRenderer, stubs};
