import LunaContainer from '../../../../packages/luna/src/framework/luna.js';
import ComponentLoader from '../../../../packages/luna/src/framework/loaders/component-loader.js';
import DocumentRenderer from '../../../../packages/luna/src/framework/engine/document-renderer.js';
import ElementFactory from '../../../../packages/luna/src/framework/engine/element-factory.js';
import { CurrentRequest } from '@webtides/luna-js';
import { assertContains, assertNotContains } from '../../../helpers/index.js';
import assert from 'node:assert';

class TestElementFactory extends ElementFactory {
	async getInitialProperties() {
		const properties = typeof this.element.properties === 'function' ? this.element.properties() : {};
		return {
			...properties,
		};
	}
}

export default () => {
	describe('Luna base renderer test', () => {
		before(async () => {
			const luna = new LunaContainer({});
			await luna.prepare();

			global.luna = luna;
		});

		after(() => {
			global.luna = null;
		});

		it('renders the component content in the dom', async () => {
			const component = {
				element: class {
					template() {
						return `TestContent`;
					}
				},
				tagName: 'example-component',
				children: [],
				ElementFactory: TestElementFactory,
			};

			global.luna.get(ComponentLoader).allAvailableComponents[component.tagName] = component;

			const documentRenderer = new DocumentRenderer({ request: null, response: null });
			const result = await documentRenderer.renderUsingPostHtml(`
            <html><head></head><body><example-component></example-component></body></html>
        `);

			assert.ok(result.includes('TestContent'), 'value should include text');
		});

		it('renders the component children in the dom', async () => {
			const component = {
				element: class {
					template() {
						return `<child-component></child-component>`;
					}
				},
				tagName: 'example-component',
				children: [],
				ElementFactory: TestElementFactory,
			};

			const childComponent = {
				element: class {
					template() {
						return `I am the child component`;
					}
				},
				tagName: 'child-component',
				children: [],
				ElementFactory: TestElementFactory,
			};

			global.luna.get(ComponentLoader).allAvailableComponents[component.tagName] = component;
			global.luna.get(ComponentLoader).allAvailableComponents[childComponent.tagName] = childComponent;

			const documentRenderer = new DocumentRenderer({ request: null, response: null });
			const result = await documentRenderer.renderUsingPostHtml(`
            <html><head></head><body><example-component></example-component></body></html>
        `);

			assertContains(result, '<child-component');
			assertContains(result, 'I am the child component');
		});

		it('removes the dot from rendered attributes', async () => {
			const component = {
				element: class {
					template() {
						return ``;
					}
				},
				tagName: 'example-component',
				children: [],
				ElementFactory: TestElementFactory,
			};

			global.luna.get(ComponentLoader).allAvailableComponents[component.tagName] = component;

			const documentRenderer = new DocumentRenderer({ request: null, response: null });
			const result = await documentRenderer.renderUsingPostHtml(`
            <html><head></head><body><example-component .foo="bar"></example-component></body></html>
        `);

			assertNotContains(result, '.foo="bar"');
			assertContains(result, 'foo="bar"');
		});

		it('mirrors the properties back to the attributes', async () => {
			const component = {
				element: class {
					static $$luna = {
						target: 'both',
					};

					async loadDynamicProperties() {
						return {
							arrayProperty: [{ foo: 'bar' }],
							objectProperty: { foo: 'bar' },
							stringProperty: 'bar',
						};
					}

					properties() {
						return {
							stringProperty: 'foo',
							objectProperty: {},
							arrayProperty: [],
						};
					}

					template() {
						return ``;
					}
				},
				tagName: 'example-component',
				children: [],
				ElementFactory: TestElementFactory,
			};

			global.luna.get(ComponentLoader).allAvailableComponents[component.tagName] = component;

			const documentRenderer = new DocumentRenderer({ request: null, response: null });
			const result = await documentRenderer.renderUsingPostHtml(
				'<html><head></head><body><example-component></example-component></body></html>',
			);

			assertContains(result, 'string-property="bar"');
			assertContains(result, 'object-property="{&quot;foo&quot;:&quot;bar&quot;}"');
			assertContains(result, 'array-property="[{&quot;foo&quot;:&quot;bar&quot;}]"');
		});

		it('mirrors the properties back to the attributes for client only components but does not render them', async () => {
			const component = {
				element: class {
					static $$luna = {
						target: 'client',
					};

					async loadDynamicProperties() {
						return {
							arrayProperty: [{ foo: 'bar' }],
							objectProperty: { foo: 'bar' },
							stringProperty: 'bar',
						};
					}

					properties() {
						return {
							stringProperty: 'foo',
							objectProperty: {},
							arrayProperty: [],
						};
					}

					template() {
						return `NOT BEING RENDERED`;
					}
				},
				tagName: 'example-component',
				children: [],
				ElementFactory: TestElementFactory,
			};

			global.luna.get(ComponentLoader).allAvailableComponents[component.tagName] = component;

			const documentRenderer = new DocumentRenderer({ request: null, response: null });
			const result = await documentRenderer.renderUsingPostHtml(
				'<html><head></head><body><example-component></example-component></body></html>',
			);

			assertContains(result, `string-property="bar"`);
			assertContains(result, `object-property="{&quot;foo&quot;:&quot;bar&quot;}"`);
			assertContains(result, `array-property="[{&quot;foo&quot;:&quot;bar&quot;}]"`);
			assertNotContains(result, 'NOT BEING RENDERED');
		});

		it('injects the current request in the element', async () => {
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

					template() {
						return `${this.hasRequest}`;
					}
				},
				tagName: 'example-component',
				children: [],
				ElementFactory: TestElementFactory,
			};

			global.luna.get(ComponentLoader).allAvailableComponents[component.tagName] = component;

			const documentRenderer = new DocumentRenderer({ request: 'injected', response: null });
			const result = await documentRenderer.renderUsingPostHtml(
				'<html><head></head><body><example-component></example-component></body></html>',
			);

			assertContains(result, 'injected');
		});
	});
};
