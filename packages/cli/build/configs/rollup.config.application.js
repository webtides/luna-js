import serverBundles from './rollup.config.server.js';
import clientBundles from './rollup.config.client.js';

export default async () => [...(await serverBundles()), ...(await clientBundles())];
