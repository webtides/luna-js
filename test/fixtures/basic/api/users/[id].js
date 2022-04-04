const get = async ({ request, response }) => {
	return response.json({
		id: request.params.id,
		post: false,
	});
};

const post = async ({ request, response }) => {
	return response.json({
		id: request.params.id,
		post: true,
	});
};

const remove = async ({ request, response }) => {
	return response.json({
		id: request.params.id,
		delete: true,
	});
};

const put = async ({ request, response }) => {
	return response.json({
		id: request.params.id,
		put: true,
	});
};

export { get, post, put, remove };
