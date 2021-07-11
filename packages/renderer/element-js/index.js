import ElementFactory from './element-factory';
import TemplateRenderer from "./template-renderer";

const stubs = [{
    sources: ['@webtides/element-js'],
    stub: `
        import { html } from '@popeindustries/lit-html-server';
        class TemplateElement {}
        export { TemplateElement, html }
    `
}, {
    sources: ['lit-html/directives/unsafe-html'],
    stub: `
        import { unsafeHTML } from '@popeindustries/lit-html-server/directives/unsafe-html';
        export { unsafeHTML }
    `
}];

export {ElementFactory, TemplateRenderer, stubs};
