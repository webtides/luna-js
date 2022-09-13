export default class PropertyComponent {
	foo = 'bar';
	dashToCamel = 'DASH-MOCHA';

	get template() {
		return `
            PROPERTY COMPONENT ${this.foo} ${this.dashToCamel}
        `;
	}
}
