import ElementFactory from './element-factory';
import TemplateRenderer from "./template-renderer";

const stubs = async () => [{
    sources: ['@webtides/element-js'],
    stub: require.resolve('./stubs/index.js'),
},{
    sources: ['@webtides/element-js/src/renderer/vanilla'],
    stub: require.resolve('./stubs/vanilla.js'),
}, {
    sources: ['lit-html/directives/unsafe-html'],
    stub: require.resolve('./stubs/unsafe-html.js'),
}];

export {ElementFactory, TemplateRenderer, stubs};
