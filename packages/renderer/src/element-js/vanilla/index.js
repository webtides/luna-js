import TemplateRenderer from "./template-renderer";
import ElementFactoryFactory from "../shared/element-factory";

const ElementFactory = ElementFactoryFactory(TemplateRenderer);

const stubs = async () => [{
    sources: ['@webtides/element-js/src/renderer/vanilla'],
    stub: require.resolve('./stubs/index.js'),
}];

export {ElementFactory, TemplateRenderer, stubs};
