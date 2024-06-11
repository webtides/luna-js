class BaseElement {
	constructor(options) {
		this._options = {
			...(options ?? {}),
		};
	}
}
class StyledElement extends BaseElement {
	constructor(options) {
		super(options);

		this._styles = [...(this._options?.styles ?? []), ...this.styles()];
	}

	styles() {
		return [];
	}
}
class TemplateElement extends StyledElement{
}

export { BaseElement, StyledElement, TemplateElement };
