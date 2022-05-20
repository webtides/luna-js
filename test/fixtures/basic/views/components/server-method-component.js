import {Component, ServerMethod} from '@webtides/luna-js';

@Component({
	target: Component.TARGET_BOTH,
})
export default class ServerMethodComponent extends HTMLElement {

	@ServerMethod()
	async returnParameter(parameter, secondParameter) {
		return { parameter, secondParameter };
	}

	@ServerMethod()
	async returnContext() {
		return {
			context: this.foo,
		};
	}

	async notInvokable() {
		return {
			foo: 'bar',
		};
	}
}
