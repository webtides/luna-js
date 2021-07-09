import layout from "../../layouts/base";
export { layout };


export default async ({ request }) => {
    return `ID: ${request.params.id}`;
};
