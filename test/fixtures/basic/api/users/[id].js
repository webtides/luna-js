const get = async ({ request, response }) => {
    return response.json({
        id: request.params.id,
        post: false
    });
};

const post = async ({ request, response }) => {
    return response.json({
        id: request.params.id,
        post: true
    });
};

export { get, post };
