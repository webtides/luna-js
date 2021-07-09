import layout from "../../layouts/base";
export { layout };

export default class ParamPage {

    async loadDynamicProperties({ request }) {
        return {
            id: request.params.id
        }
    }

    template() {
        return `
            ID: ${this.id}
        `;
    }
}
