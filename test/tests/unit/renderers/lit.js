import { ElementFactory, LitElement, html } from '../../../../packages/renderer/src/lit/index.js';
import { customElement, property } from '../../../../packages/renderer/src/lit/decorators.js';
import ElementRenderer from '../../../../packages/luna/src/framework/engine/element-renderer.js';
import ServiceContainer from '../../../../packages/luna/src/framework/services/service-container.js';
import { CurrentRequest } from '@webtides/luna-js';
import { assertContains } from '../../../helpers/index.js';
import assert from 'node:assert';

export default () => {
	describe('Lit server renderer test', function () {
		ServiceContainer.set(ElementRenderer, new ElementRenderer());

		it('should render the component template as a string', async () => {
			const component = {
				element: class extends LitElement {
					render() {
						return html` <div>This should be rendered as a string.</div> `;
					}
				},
				ElementFactory: ElementFactory,
			};

			const renderer = ServiceContainer.get(ElementRenderer);
			const result = await renderer.renderComponent({ component, attributes: {}, request: null, response: null });

			assertContains(result.markup, '<div>This should be rendered as a string.</div>');
		});

		it('ignore the lit decorators', async () => {
			const component = {
				element:
					(
						@customElement('my-element')
						class extends LitElement {
							@property()
							foo = 'bar';

							render() {
								return html` <div>This should be rendered as a string.</div> `;
							}
						}
					),
				ElementFactory: ElementFactory,
			};

			const renderer = ServiceContainer.get(ElementRenderer);
			const result = await renderer.renderComponent({ component, attributes: {}, request: null, response: null });

			assertContains(result.markup, '<div>This should be rendered as a string.</div>');
		});

		it('should pass the attributes to the component', async () => {
			const component = {
				element: class extends LitElement {
					properties() {
						return {
							text: 'no',
						};
					}

					render() {
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

			assertContains(result.markup, '<div><!--lit-part-->yes<!--/lit-part--></div>');
		});

		// TODO: fix?!
		// it('should parse dot-attributes as json', async () => {
		// 	const component = {
		// 		element: class extends LitElement {
		// 			properties() {
		// 				return {
		// 					test: { foo: 'bar' },
		// 				};
		// 			}
		//
		// 			render() {
		// 				return html` <div>${this.test.foo}</div> `;
		// 			}
		// 		},
		// 		ElementFactory: ElementFactory,
		// 	};
		//
		// 	const renderer = ServiceContainer.get(ElementRenderer);
		// 	const result = await renderer.renderComponent({
		// 		component,
		// 		attributes: { '.test': { foo: 'foo' } },
		// 		request: null,
		// 		response: null,
		// 	});
		//
		// 	console.log('result', result);
		// 	chai.expect(result.markup).to.contain('<div><!--lit-part-->foo<!--/lit-part--></div>');
		// 	chai.expect(result.finalAttributes.test.foo).to.equal('foo');
		// });

		// TODO: fix... for some reason the boolean is cast to a string?!
		// it('should not parse boolean attributes to a string', async () => {
		// 	const component = {
		// 		element: class extends LitElement {
		// 			render() {
		// 				return html``;
		// 			}
		// 		},
		// 		ElementFactory: ElementFactory,
		// 	};
		//
		// 	const renderer = ServiceContainer.get(ElementRenderer);
		// 	const result = await renderer.renderComponent({
		// 		component,
		// 		attributes: { foo: false },
		// 		request: null,
		// 		response: null,
		// 	});
		//
		// assert.equal(result.finalAttributes.foo, false);
		// });

		it('should set the "ssr" attributes', async () => {
			const component = {
				element: class extends LitElement {
					render() {
						return html``;
					}
				},
				ElementFactory: ElementFactory,
			};

			const renderer = ServiceContainer.get(ElementRenderer);
			const result = await renderer.renderComponent({ component, attributes: {}, request: null, response: null });

			assert.equal(result.finalAttributes.ssr, true);
		});

		// TODO: why should it not render?!
		// it('should not try to render the LitElement without render function', async () => {
		// 	const component = {
		// 		element: class extends LitElement {
		// 			properties() {
		// 				return {
		// 					test: 'no',
		// 				};
		// 			}
		// 		},
		// 		ElementFactory: ElementFactory,
		// 	};
		//
		// 	const renderer = ServiceContainer.get(ElementRenderer);
		// 	const result = await renderer.renderComponent({
		// 		component,
		// 		attributes: { text: 'yes' },
		// 		request: null,
		// 		response: null,
		// 	});
		//
		// 	console.log('result', result);
		// 	assert.equal(result, false);
		// });

		it('injects the current request in the lit element', async () => {
			const component = {
				element: class {
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

					render() {
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
