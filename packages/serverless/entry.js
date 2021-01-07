const { prepareServer } = require("../framework/index.js");
const serverless = require("serverless-http");
const path = require("path");

module.exports.handler = async (event, context) => {
    const app = await prepareServer();
    return serverless(app)(event, context);
};
