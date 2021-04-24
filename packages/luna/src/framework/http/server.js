import {LunaService} from "../../decorators/service.js";
import {getSettings} from "../config.js";
import bodyParser from "body-parser";
import express from "express";
import {callHook} from "../hooks";
import {HOOKS} from "../hooks/definitions.js";
import {registerMiddleware} from "./middleware/index.js";
import {cacheMiddleware} from "./middleware/cache-middleware.js";
import {routes} from "./router/routes.js";

@LunaService({
    name: 'LunaServer'
})
export default class Server {
    connections = [];

    baseMiddleware = [
        bodyParser.urlencoded(),
        bodyParser.json(),
    ];

    async prepare() {
        this.settings = getSettings();

        const app = express();

        this.baseMiddleware.forEach(middleware => app.use(middleware));

        await registerMiddleware({app});
        app.use(cacheMiddleware());

        await callHook(HOOKS.ROUTES_BEFORE_REGISTER, {
            router: app
        });

        await routes({router: app});

        await callHook(HOOKS.ROUTES_AFTER_REGISTER, {
            router: app
        });

        this.app = app;
    }

    async start() {
        if (!this.app) {
            await this.prepare();
        }

        return new Promise((resolve, reject) => {
            const server = this.app.listen(this.settings.port,
                async () => {
                    await callHook(HOOKS.SERVER_STARTED, {
                        app: this.app
                    });

                    console.log(`luna-js listening at port ${this.settings.port}.`);

                    resolve();
                });

            server.on('connection', (connection) => {
                this.connections.push(connection);
                connection.on('close', () => {
                    this.connections = this.connections.filter(row => row !== connection);
                });
            });

            this.server = server;
        });
    }

    stop() {
        if (!this.server) {
            return;
        }

        return new Promise((resolve) => {
            this.connections.forEach(connection => connection.destroy());
            this.server.close(() => resolve());
        });
    }

    async restart() {
        await this.stop();
        return this.start();
    }
}
