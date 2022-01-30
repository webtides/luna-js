import {renderToString} from "@popeindustries/lit-html-server";

export default class TemplateRenderer {
    async renderToString(template, options) {
        const result = await renderToString(template, options);
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
