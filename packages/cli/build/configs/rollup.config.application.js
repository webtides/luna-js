import serverBundles from "./rollup.config.server";
import clientBundles from "./rollup.config.client";

export default async () => [
    ...(await serverBundles()),
    ...(await clientBundles()),
];
