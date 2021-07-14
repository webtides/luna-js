import ElementFactory from './element-factory';
import TemplateRenderer from "./template-renderer";

const stubs = async () => [{
    sources: ['@webtides/element-js'],
    stub: require.resolve('./stubs/index.js'),
}, {
    sources: ['lit-html/directives/unsafe-html'],
    stub: require.resolve('./stubs/directives/unsafe-html.js'),
}];

export {ElementFactory, TemplateRenderer, stubs};
