import WebSocket from "ws";
import {getSettings} from "@webtides/luna-js/src/framework/config";

let livereloadServer = false;
const livereloadConnections = [];

const startLivereloadServer = async () => {
    const {port, build} = getSettings();

    if (!build.livereload) {
        return;
    }

    const livereloadPort = port + 1;
    livereloadServer = new WebSocket.Server({port: livereloadPort});

    livereloadServer.on('connection', (clientSocket) => {
        console.log('Livereload server: new connection');

        livereloadConnections.push(clientSocket);

        clientSocket.on('close', () => {
            const index = livereloadConnections.findIndex(connection => connection === clientSocket);
            if (index !== -1) {
                livereloadConnections.splice(index, 1);
            }
        });
    });

    luna.set(
        'documentInject',
        `${luna.get('documentInject') || ''}<script type="text/javascript" src="/assets/dev/livereload.js"></script>`
    );

    console.log(`Livereload server started on port ${livereloadPort}.`);
};

const sendReloadMessage = async () => {
    livereloadConnections.forEach(connection => {
        connection.send(JSON.stringify({
            action: 'reload'
        }));
    })
};

export {
    sendReloadMessage,
    startLivereloadServer
}
