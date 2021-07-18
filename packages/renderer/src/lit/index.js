import ElementFactory from './element-factory';
import TemplateRenderer from "./template-renderer";
const stubs = async () => [{
    sources: ['lit'],
    stub: require.resolve('./stubs/index.js'),
}, {
    sources: ['lit/decorators', 'lit/decorators.js'],
    stub: require.resolve('./stubs/decorators.js'),
}];

export {ElementFactory, TemplateRenderer, stubs };
