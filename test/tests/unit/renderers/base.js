import LunaContainer from "../../../../packages/luna/src/framework/luna";
import ComponentLoader from "../../../../packages/luna/src/framework/loaders/component-loader";
import DocumentRenderer from "../../../../packages/luna/src/framework/engine/document-renderer";
import ElementFactory from "../../../../packages/luna/src/framework/engine/element-factory";
import {chai} from "../../../helpers";

class TestElementFactory extends ElementFactory {
    async getInitialProperties() {
        const properties = typeof this.element.properties === 'function' ? this.element.properties() : {};
        return {
            ...properties,
        };
    }
}

describe("Luna base renderer test", () => {

    beforeEach(async () => {
        const luna = new LunaContainer({});
        await luna.prepare();

        global.luna = luna;
    });

    afterEach(() => {
        global.luna = null;
    });

    it('renders the component content in the dom', async () => {
        const component = {
            element: (class {
                template() {
                    return `TestContent`;
                }
            }),
            tagName: 'example-component',
            children: [],
            ElementFactory: TestElementFactory,
        };

        luna.get(ComponentLoader).allAvailableComponents[component.tagName] = component;

        const documentRenderer = new DocumentRenderer({ request: null, response: null });
        const result = await documentRenderer.renderUsingPostHtml(`
            <html><head></head><body><example-component></example-component></body></html>
        `);

        chai.expect(result).to.contain(`TestContent`);
    });

    it('renders the component children in the dom', async () => {
        const component = {
            element: (class {
                template() {
                    return `<child-component></child-component>`;
                }
            }),
            tagName: 'example-component',
            children: [],
            ElementFactory: TestElementFactory,
        };

        const childComponent = {
            element: (class {
                template() {
                    return `I am the child component`;
                }
            }),
            tagName: 'child-component',
            children: [],
            ElementFactory: TestElementFactory,
        };

        luna.get(ComponentLoader).allAvailableComponents[component.tagName] = component;
        luna.get(ComponentLoader).allAvailableComponents[childComponent.tagName] = childComponent;

        const documentRenderer = new DocumentRenderer({ request: null, response: null });
        const result = await documentRenderer.renderUsingPostHtml(`
            <html><head></head><body><example-component></example-component></body></html>
        `);

        chai.expect(result).to.contain(`<child-component`);
        chai.expect(result).to.contain('I am the child component');
    });

    it('removes the dot from rendered attributes', async () => {
        const component = {
            element: (class {
                template() {
                    return ``;
                }
            }),
            tagName: 'example-component',
            children: [],
            ElementFactory: TestElementFactory,
        };

        luna.get(ComponentLoader).allAvailableComponents[component.tagName] = component;

        const documentRenderer = new DocumentRenderer({ request: null, response: null });
        const result = await documentRenderer.renderUsingPostHtml(`
            <html><head></head><body><example-component .foo="bar"></example-component></body></html>
        `);

        chai.expect(result).to.not.contain(`.foo="bar"`);
        chai.expect(result).to.contain(`foo="bar"`);
    });

    it('mirrors the properties back to the attributes', async () => {
        const component = {
            element: (class {
                $$luna = {
                    target: 'both',
                };

                async loadDynamicProperties() {
                    return {
                        arrayProperty: [ { "foo": "bar" } ],
                        objectProperty: { "foo": "bar" },
                        stringProperty: "bar",
                    }
                }

                properties() {
                    return {
                        stringProperty: "foo",
                        objectProperty: {},
                        arrayProperty: [],
                    };
                }

                template() {
                    return ``;
                }
            }),
            tagName: 'example-component',
            children: [],
            ElementFactory: TestElementFactory,
        };

        luna.get(ComponentLoader).allAvailableComponents[component.tagName] = component;

        const documentRenderer = new DocumentRenderer({ request: null, response: null });
        const result = await documentRenderer.renderUsingPostHtml('<html><head></head><body><example-component></example-component></body></html>');

        chai.expect(result).to.contain(`string-property="bar"`);
        chai.expect(result).to.contain(`object-property='{"foo":"bar"}'`);
        chai.expect(result).to.contain(`array-property='[{"foo":"bar"}]'`);
    });
});
