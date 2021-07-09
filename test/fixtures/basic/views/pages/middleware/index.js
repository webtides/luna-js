import layout from "../../layouts/base";
export { layout };

const middleware = [
    (request, response, next) => {
        response.set('luna-middleware', 'works');
        next();
    }
];

export { middleware };

export default async () => {
    return ``;
}
