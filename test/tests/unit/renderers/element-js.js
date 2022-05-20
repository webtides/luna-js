import { TemplateElement, BaseElement, html } from '../../../../packages/renderer/lib/element-js/lit/stubs';
import { ElementFactory } from '../../../../packages/renderer/lib/element-js/lit';
import ElementRenderer from '../../../../packages/luna/src/framework/engine/element-renderer';
import ServiceContainer from '../../../../packages/luna/src/framework/services/service-container';

import { chai } from '../../../helpers';

describe('Element-js server renderer test', function () {
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

		chai.expect(result.markup).to.contain('<div>This should be rendered as a string.</div>');
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

		chai.expect(result.markup).to.contain('<div>yes</div>');
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

		chai.expect(result.markup).to.contain('<div>foo</div>');
		chai.expect(result.finalAttributes.test).to.equal('{&quot;foo&quot;:&quot;foo&quot;}');
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

		chai.expect(result.finalAttributes.foo).to.equal('false');
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

		chai.expect(result.finalAttributes.ssr).to.equal('true');
		chai.expect(result.finalAttributes['defer-update']).to.equal('true');
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

		chai.expect(result).to.equal(false);
	});
});
