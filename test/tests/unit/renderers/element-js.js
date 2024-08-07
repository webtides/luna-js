import '../../../../packages/renderer/src/element-js/utils/install-dom-shim.js';
import { ElementFactory } from '../../../../packages/renderer/src/element-js/index.js';
import { TemplateElement, BaseElement, html } from '../../../../packages/renderer/src/element-js/proxy.js';
import ElementRenderer from '../../../../packages/luna/src/framework/engine/element-renderer.js';
import ServiceContainer from '../../../../packages/luna/src/framework/services/service-container.js';
import { CurrentRequest } from '@webtides/luna-js';
import { assertContains } from '../../../helpers/index.js';
import assert from 'node:assert';

//TODO: make this an export from element-js?!
export const stripCommentMarkers = (html) =>
	html
		.replace(/<!--(\/)?(dom|template)-part(-\d+)?(:(@|.|\?)?\w+(=.*)?)?|(\$)?-->/g, '')
		.replace(/\s+/g, ' ')
		.replaceAll('> ', '>')
		.trim();

export default () => {
	describe('Element-js vanilla server renderer test', function () {
		ServiceContainer.set(ElementRenderer, new ElementRenderer());

		it('should render the component template as a string', async () => {
			const component = {
				element: class extends TemplateElement {
					template() {
						return html` <div>This should be rendered as a string.</div> `;
					}
				},
				ElementFactory: ElementFactory,
			};

			const renderer = ServiceContainer.get(ElementRenderer);
			const result = await renderer.renderComponent({ component, attributes: {}, request: null, response: null });

			assertContains(result.markup, '<div>This should be rendered as a string.</div>');
		});

		it('should pass the attributes to the component', async () => {
			const component = {
				element: class extends TemplateElement {
					properties() {
						return {
							text: 'no',
						};
					}

					template() {
						return html` <div>${this.text}</div> `;
					}
				},
				ElementFactory: ElementFactory,
			};

			const renderer = ServiceContainer.get(ElementRenderer);
			const result = await renderer.renderComponent({
				component,
				attributes: { text: 'yes' },
				request: null,
				response: null,
			});

			assertContains(stripCommentMarkers(result.markup), '<div>yes</div>');
		});

		it('should parse dot-attributes as json', async () => {
			const component = {
				element: class extends TemplateElement {
					properties() {
						return {
							test: { foo: 'bar' },
						};
					}

					template() {
						return html` <div>${this.test.foo}</div> `;
					}
				},
				ElementFactory: ElementFactory,
			};

			const renderer = ServiceContainer.get(ElementRenderer);
			const result = await renderer.renderComponent({
				component,
				attributes: { '.test': { foo: 'foo' } },
				request: null,
				response: null,
			});

			assertContains(stripCommentMarkers(result.markup), '<div>foo</div>');
			assert.equal(result.finalAttributes.test, '{&quot;foo&quot;:&quot;foo&quot;}');
		});

		it('should parse boolean attributes to a string', async () => {
			const component = {
				element: class extends TemplateElement {
					template() {
						return html``;
					}
				},
				ElementFactory: ElementFactory,
			};

			const renderer = ServiceContainer.get(ElementRenderer);
			const result = await renderer.renderComponent({
				component,
				attributes: { foo: false },
				request: null,
				response: null,
			});

			assert.equal(result.finalAttributes.foo, 'false');
		});

		it('should set the "ssr" and "defer-update" attributes', async () => {
			const component = {
				element: class extends TemplateElement {
					template() {
						return html``;
					}
				},
				ElementFactory: ElementFactory,
			};

			const renderer = ServiceContainer.get(ElementRenderer);
			const result = await renderer.renderComponent({ component, attributes: {}, request: null, response: null });

			assert.equal(result.finalAttributes.ssr, 'true');
			assert.equal(result.finalAttributes['defer-update'], 'true');
		});

		it('should not try to render the BaseElement', async () => {
			const component = {
				element: class extends BaseElement {
					properties() {
						return {
							test: 'no',
						};
					}
				},
				ElementFactory: ElementFactory,
			};

			const renderer = ServiceContainer.get(ElementRenderer);
			const result = await renderer.renderComponent({
				component,
				attributes: { text: 'yes' },
				request: null,
				response: null,
			});

			assert.equal(result, false);
		});

		it('injects the current request in the element-js element', async () => {
			const component = {
				element: class extends TemplateElement {
					@CurrentRequest request;

					async loadDynamicProperties() {
						return {
							hasRequest: this.request,
						};
					}

					properties() {
						return {
							hasRequest: false,
						};
					}

					template() {
						return html`${this.hasRequest}`;
					}
				},
				tagName: 'example-component',
				children: [],
				ElementFactory: ElementFactory,
			};

			const renderer = ServiceContainer.get(ElementRenderer);
			const result = await renderer.renderComponent({
				component,
				attributes: {},
				request: 'injected',
				response: null,
			});

			assertContains(result.markup, 'injected');
		});
	});
};
