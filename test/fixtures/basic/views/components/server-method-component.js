import {Component, ServerMethod} from '@webtides/luna-js';

@Component({
	target: Component.TARGET_BOTH,
})
export default class ServerMethodComponent extends HTMLElement {

	@ServerMethod()
	async printDebugMessage(parameter) {
		console.log(`TEST ${parameter}`);
		return { parameter };
	}

	async connectedCallback() {
		const result = await this.printDebugMessage("MOCHA");
		console.log(result);
	}
}
