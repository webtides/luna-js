import { Component } from '@webtides/luna-js';

@Component({
	target: Component.TARGET_SERVER,
})
export default class ExampleComponent extends HTMLElement {
	constructor(attributes) {
		super();

		this.name = attributes.name;
	}

	get template() {
		return `
            Provided to you by ${this.name}.
        `;
	}
}
