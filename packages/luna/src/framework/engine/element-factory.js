import {LunaService} from "../../decorators/service";

@LunaService({
    name: 'ElementFactory',
})
export default class ElementFactory {
    async buildElement({ component, attributes }) {
        const element = new (component.element)(attributes);
        return {element};
    }

    async template({ element }) {
        return element.template();
    }
}
