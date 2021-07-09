export default class PropertyComponent {
    foo = "bar";

    template() {
        return `
            PROPERTY COMPONENT ${this.foo}
        `;
    }
}
