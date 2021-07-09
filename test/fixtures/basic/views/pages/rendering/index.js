import layout from "../../layouts/base";
export { layout };

export default async () => {
    return `
        <example-component></example-component>
        <no-ssr-component></no-ssr-component>
    `;
};
