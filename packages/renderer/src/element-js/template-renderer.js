export default class TemplateRenderer {
    async renderToString(template, options) {
        const result = template.toString();

        if (options?.factory?.element?._options?.shadowRender === true) {
            return `<template shadowroot="open">${result}</template>`;
        }

        return result;
    }
}
