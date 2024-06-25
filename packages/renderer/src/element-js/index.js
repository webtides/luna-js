import TemplateRenderer from './template-renderer.js';
import ElementFactoryFactory from './element-factory.js';

const ElementFactory = ElementFactoryFactory(TemplateRenderer);

export { ElementFactory, TemplateRenderer };

// TODO: this is causing luna to crash on startup...
// import {
// 	BaseElement,
// 	StyledElement,
// 	TemplateElement,
// 	html,
// 	toString,
// 	defineElement,
// 	Store,
// 	Directive,
// } from '@webtides/element-js';
//
// export { BaseElement, StyledElement, TemplateElement, Store, Directive, html, toString, defineElement };
