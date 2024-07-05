import TemplateRenderer from './template-renderer.js';
import ElementFactoryFactory from './element-factory.js';

const ElementFactory = ElementFactoryFactory(TemplateRenderer);

const stubs = async () => [];

export { ElementFactory, TemplateRenderer, stubs };
