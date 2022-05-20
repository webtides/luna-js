import {Component, ServerMethod} from '@webtides/luna-js';

@Component({
	target: Component.TARGET_BOTH,
})
export default class ServerMethodComponent {

	@ServerMethod()
	async printDebugMessage(parameter) {
		console.log(`TEST ${parameter}`);
		return {};
	}

	async connectedCallback() {
		await this.printDebugMessage("MOCHA");
	}
}
