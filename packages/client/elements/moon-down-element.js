import MoonElement from "./moon-element";

export default class MoonDownElement extends MoonElement {

    async loadDynamicProperties({ request, response }) {
        if (!this.source) {
            return {};
        }

        const fs = (await import("fs")).default;

        if (!fs.existsSync(this.source)) {
            console.log(`File ${this.source} does not exist.`)
            return {};
        }

        const frontmatter = (await import("@github-docs/frontmatter")).default;
        const marked = (await import("marked")).default;

        const result = frontmatter(fs.readFileSync(this.source, { encoding: "utf-8" }));

        return {
            text: marked(result.content),
            ...result.data
        }
    }

    static get dynamicPropertiesCacheable() {
        return true;
    }
}
