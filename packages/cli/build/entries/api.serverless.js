import dotenv from 'dotenv';
dotenv.config();

import serverless from 'serverless-http';

import { prepareApiServer, callHook, HOOKS } from '@webtides/luna-cli/build/entries/helpers/prepare.js';

const apisToRegister = [];
const hooksToRegister = [];

__IMPORTS__;

const handler = async (event, context) => {
	const app = await prepareApiServer({
		hooks: hooksToRegister,
		apis: apisToRegister,
		fallbackApiRoute: __FALLBACK_API_ROUTE__,
		serveStaticSite: __SERVE_STATIC_SITE__,
	});

	await callHook(HOOKS.SERVER_STARTED, {
		app,
	});

	return serverless(app, {
		binary: ['image/*', 'application/*'],
	})(event, context);
};

export { handler };
