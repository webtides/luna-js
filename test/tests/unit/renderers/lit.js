// This import is needed that lit can set the global dom shim
import { TemplateRenderer } from '../../../../packages/renderer/lib/lit';

import { LitElement, html } from '../../../../packages/renderer/lib/lit/stubs';
import { ElementFactory } from '../../../../packages/renderer/lib/lit';
import { customElement, property } from '../../../../packages/renderer/lib/lit/stubs/decorators';

import ElementRenderer from '../../../../packages/luna/src/framework/engine/element-renderer';
import ServiceContainer from '../../../../packages/luna/src/framework/services/service-container';
import { chai } from '../../../helpers';

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

		chai.expect(result.markup).to.contain('<div>This should be rendered as a string.</div>');
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

		chai.expect(result.markup).to.contain('<div>This should be rendered as a string.</div>');
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

		chai.expect(result.markup).to.contain('<div><!--lit-part-->yes<!--/lit-part--></div>');
	});

	it('should parse dot-attributes as json', async () => {
		const component = {
			element: class extends LitElement {
				properties() {
					return {
						test: { foo: 'bar' },
					};
				}

				render() {
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

		chai.expect(result.markup).to.contain('<div><!--lit-part-->foo<!--/lit-part--></div>');
		chai.expect(result.finalAttributes.test.foo).to.equal('foo');
	});

	it('should not parse boolean attributes to a string', async () => {
		const component = {
			element: class extends LitElement {
				render() {
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

		chai.expect(result.finalAttributes.foo).to.equal(false);
	});

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

		chai.expect(result.finalAttributes.ssr).to.equal(true);
	});

	it('should not try to render the LitElement without render function', async () => {
		const component = {
			element: class extends LitElement {
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

		chai.expect(result).to.equal(false);
	});
});
