export default class TemplateRenderer {
    async renderToString(template, options) {
        let result = template.toString();

        const shadowRender = options?.factory && await options.factory.renderInShadowDom();
        if (shadowRender) {
            const styles = options.factory.element._styles ?? [];
            styles.forEach((style) => {
            	result += `<style>${style}</style>`;
			});
        }

        return result;
    }
}
