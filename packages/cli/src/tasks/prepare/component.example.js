export default class ExampleComponent extends HTMLElement {

    constructor(attributes) {
        super();

        this.name = attributes.name;
    }

    template() {
        return `
            Provided to you by ${this.name}.
        `;
    }
}
