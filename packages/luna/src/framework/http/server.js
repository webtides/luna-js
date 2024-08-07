import bodyParser from 'body-parser';
import express from 'express';

import { LunaService } from '../../decorators/service.js';
import { getSettings } from '../config.js';
import { callHook } from '../hooks/index.js';
import { HOOKS } from '../hooks/definitions.js';
import { registerMiddleware } from './middleware/index.js';
import { upgradeRequestMiddleware } from './middleware/upgrade-request-middleware.js';
import { routes } from './router/routes.js';

class Server {
	constructor() {
		this.connections = [];
		this.baseMiddleware = [
			upgradeRequestMiddleware(),
			bodyParser.urlencoded({ extended: true }),
			bodyParser.json(),
			express.static('.build/public'),
		];
	}

	async prepare() {
		this.settings = getSettings();

		const app = express();

        const { baseMiddleware } = (await callHook(HOOKS.BASE_MIDDLEWARE_REGISTER, {
          app,
          baseMiddleware: this.baseMiddleware,
        }));

        baseMiddleware.forEach(middleware => app.use(middleware));

		await registerMiddleware({ app });

		await callHook(HOOKS.ROUTES_BEFORE_REGISTER, {
			router: app,
		});

		await routes({ router: app });

		await callHook(HOOKS.ROUTES_AFTER_REGISTER, {
			router: app,
		});

		this.app = app;
	}

	async start() {
		if (!this.app) {
			await this.prepare();
		}

		return new Promise((resolve, reject) => {
			const server = this.app.listen(this.settings.port, async () => {
				await callHook(HOOKS.SERVER_STARTED, {
					app: this.app,
				});

				console.log(`luna-js listening at port ${this.settings.port}.`);

				resolve();
			});

			server.on('connection', (connection) => {
				this.connections.push(connection);
				connection.on('close', () => {
					this.connections = this.connections.filter((row) => row !== connection);
				});
			});

			this.server = server;
		});
	}

    async stop() {
        if (!this.server) {
            return;
        }

		return new Promise((resolve) => {
			this.connections.forEach((connection) => connection.destroy());
			this.server.close(() => resolve());
		});
	}

	async restart() {
		await this.stop();
		return this.start();
	}

	async reset() {
		this.app = null;
		return this.restart();
	}
}

export default LunaService({ name: 'Server' })(Server);
