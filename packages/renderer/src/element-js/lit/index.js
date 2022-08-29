import ElementFactoryFactory from '../shared/element-factory.js';
import TemplateRenderer from "./template-renderer.js";

const ElementFactory = ElementFactoryFactory(TemplateRenderer);

const stubs = async () => [{
    sources: ['@webtides/element-js'],
    stub: require.resolve('./stubs/index.js'),
}, {
    sources: ['lit-html/directives/unsafe-html.js', 'lit-html/directives/unsafe-html'],
    stub: require.resolve('./stubs/unsafe-html.js'),
}];

export {ElementFactory, TemplateRenderer, stubs};
