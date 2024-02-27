const upgradeRequestMiddleware = () => async (request, response, next) => {
	request.$$luna = {
		services: {},
	};

	next();
};

export { upgradeRequestMiddleware };
