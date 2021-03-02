/**
 * Imports the startServer method from the build folders. Only works
 * after moon-js has been transpiled.
 */
const { startServer } = require("./lib/packages/framework");
startServer();
