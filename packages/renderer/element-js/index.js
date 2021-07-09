import ElementFactory from './element-factory';
import TemplateRenderer from "./template-renderer";

const stubs = [{
    sources: ['@webtides/element-js'],
    stub: `
        import { html } from '@popeindustries/lit-html-server';
        class TemplateElement {}
        export { TemplateElement, html }
    `
}];

export {ElementFactory, TemplateRenderer, stubs};
