import serverBundles from "./rollup.config.server";
import clientBundles from "./rollup.config.client";

module.exports = async () => [
    ...(await serverBundles()),
    ...(await clientBundles()),
];
