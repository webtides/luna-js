import { Component } from '@webtides/luna-js';

@Component({
	target: Component.TARGET_BOTH,
})
export default class ClientComponent {
	get template() {
		return `
            CLIENT COMPONENT
        `;
	}
}
