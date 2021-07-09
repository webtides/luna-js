export default class PropertyComponent {
    foo = "bar";

    get template() {
        return `
            PROPERTY COMPONENT ${this.foo}
        `;
    }
}
