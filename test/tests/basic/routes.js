import { httpRequest, assertContains } from '../../helpers/index.js';
import assert from 'node:assert';

export const basicRoutesTest = () => {
	describe('Luna routes test', () => {
		before(async () => {
			process.chdir(global.getCurrentWorkingDirectory('basic'));
			global.originalConsoleLog = console.log;
			console.log = () => {};
			const { startLuna } = await import('../../../packages/luna/src/framework/index.js');
			await startLuna();
		});

		after(async () => {
			const { stopLuna } = await import('../../../packages/luna/src/framework/index.js');
			await stopLuna();
			console.log = global.originalConsoleLog;
		});

		// TODO: maybe use native request response objects to assert things?!
		// https://developer.mozilla.org/en-US/docs/Web/API/Request#examples
		describe('Special cases', function () {
			it('should use the fallback route the /foo route', async function () {
				const { error, response } = await httpRequest('http://localhost:3010/foo');
				assert.equal(response.status, 200);
				assertContains(response.text, 'MOCHA FALLBACK PAGE');
			});
		});

		describe('Index page', function () {
			it('registers the index route', async function () {
				const { error, response } = await httpRequest('http://localhost:3010/');
				assert.equal(response.status, 200);
			});

			it('has the "text/html" content type', async function () {
				const { error, response } = await httpRequest('http://localhost:3010/');
				assertContains(response.headers.get('content-type'), 'text/html');
			});

			it('prints "HELLO MOCHA" on the index page', async function () {
				const { error, response } = await httpRequest('http://localhost:3010/');
				assert.equal(typeof response.text, 'string');
				assertContains(response.text, 'HELLO MOCHA');
			});
		});

		describe('Page with parameters', function () {
			it('registers a route with a parameter', async function () {
				const { error, response } = await httpRequest('http://localhost:3010/params/test');
				assert.equal(response.status, 200);
			});

			it('prints the dynamic parameter on the screen', async function () {
				const randomParameter = Math.random() * 100;

				const { response } = await httpRequest(`http://localhost:3010/params/${randomParameter}`);
				assert.equal(response.status, 200);
				assertContains(response.text, `ID: ${randomParameter}`);

				const secondRandomParameter = Math.random() * 1000;

				const { response: response2 } = await httpRequest(
					`http://localhost:3010/params/${secondRandomParameter}`,
				);
				assert.equal(response2.status, 200);
				assertContains(response2.text, `ID: ${secondRandomParameter}`);
			});

			it('registers the routes with no parameters more early', async function () {
				const { response } = await httpRequest(`http://localhost:3010/params/existing`);
				assert.equal(response.status, 200);
				assertContains(response.text, `NO PARAMETER`);
			});
		});

		describe('Page with layout', function () {
			it('uses the defined layout', async function () {
				const { response } = await httpRequest(`http://localhost:3010/layout`);
				assertContains(response.text, `MOCHA LAYOUT`);
			});

			it('uses the context in the layout', async function () {
				const { response } = await httpRequest(`http://localhost:3010/layout`);
				assertContains(response.text, `MOCHA CONTEXT`);
			});
		});

		describe('Page with middleware', function () {
			it('registers the defined middleware', async function () {
				const { response } = await httpRequest(`http://localhost:3010/middleware`);
				assert.equal(response.status, 200);
				assert.equal(response.headers.get('luna-middleware'), 'works');
			});

			it('does not register middleware for other routes', async function () {
				const { response } = await httpRequest(`http://localhost:3010/`);
				assert.equal(response.headers.get('luna-middleware'), undefined);
			});
		});

		describe('Page with markdown import', function () {
			it('correctly loads the markdown import', async function () {
				const { response } = await httpRequest(`http://localhost:3010/markdown`);
				assertContains(response.text, 'SUCCESS');
				assertContains(response.text, 'I am a <strong>markdown</strong> text.');
			});
		});

		describe('Page with redirect', function () {
			it('correctly performs the redirect', async function () {
				const { response } = await httpRequest(`http://localhost:3010/redirect/component`);
				assertContains(response.text, 'HELLO MOCHA');
			});

			it('correctly performs the redirect with a component page', async function () {
				const { response } = await httpRequest(`http://localhost:3010/redirect/component`);
				assertContains(response.text, 'HELLO MOCHA');
			});
		});

		describe('Route cache', function () {
			before(async () => {
				const MemoryCache = (await import('../../../packages/luna/src/framework/cache/memory-cache.js'))
					.default;

				class TestCache extends MemoryCache {
					async get(key, group = 'default', defaultValue = false) {
						console.log('Cache hit', { group, key });
						return super.get(key, group, defaultValue);
					}
				}

				luna.set('Cache', new TestCache());
			});

			it('caches the route on the second request', async function () {
				let count = 0;
				console.log = (text, data) => {
					if (text.trim() === 'Cache hit' && data && data.group === 'routes') {
						count++;
					}
				};

				const result = await httpRequest(`http://localhost:3010/cache`);
				const secondResult = await httpRequest(`http://localhost:3010/cache`);
				assert.equal(result.response.status, 200);
				assert.equal(secondResult.response.status, 200);
				assert.equal(count, 1);
			});
		});
	});
};
