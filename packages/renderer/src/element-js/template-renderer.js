export default class TemplateRenderer {
    async renderToString(template, options) {
        const result = template.toString();

        const element = options?.factory?.element ?? null;

        if (element?._options?.shadowRender === true) {
            const styles = element._styles ?? [];

            return `
                <template shadowroot="open">
                    ${result}
                    ${styles.map(style => `<style>${style}</style>`).join('')}
                </template>
            `;
        }

        return result;
    }
}
