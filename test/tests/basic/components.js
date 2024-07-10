import { assertContains, assertNotContains, httpRequest } from '../../helpers/index.js';
import assert from 'node:assert';

export const basicComponentsTest = () => {
	describe('Luna element test', function () {
		before(async function () {
			process.chdir(global.getCurrentWorkingDirectory('basic'));
			const { startLuna } = await import('../../../packages/luna/src/framework/index.js');
			global.originalConsoleLog = console.log;
			console.log = () => {};
			await startLuna();
		});

		after(async function () {
			const { stopLuna } = await import('../../../packages/luna/src/framework/index.js');
			await stopLuna();
			console.log = global.originalConsoleLog;
		});

		describe('Basic component tests', function () {
			it('renders the component on the server', async function () {
				const { response } = await httpRequest('http://localhost:3010/rendering');
				assertContains(response.text, 'MOCHA COMPONENT');
			});

			it("doesn't render the no-ssr-component on the server", async function () {
				const { response } = await httpRequest('http://localhost:3010/rendering');
				assertContains(response.text, '<no-ssr-component');
				assertNotContains(response.text, 'NO SSR COMPONENT');
			});

			// TODO: fix test
			// it('loads the dependencies of no ssr components', async function () {
			// 	const { response } = await httpRequest('http://localhost:3010/rendering');
			// 	assertContains(response.text, '/client-component.js');
			// });

			it('renders the properties correctly', async function () {
				const { response } = await httpRequest('http://localhost:3010/rendering/properties');
				assertContains(response.text, 'PROPERTY COMPONENT MOCHA');
				assertNotContains(response.text, 'DASH-MOCHA');
				assertContains(response.text, 'CAMEL-MOCHA');
			});
		});

		describe('Special cases', function () {
			it('correctly performs the redirect', async function () {
				const { response } = await httpRequest('http://localhost:3010/redirect/component');
				assertContains(response.text, 'HELLO MOCHA');
			});
		});

		describe('Different method contexts', function () {
			it('invokes the function with the correct parameters', async function () {
				const { response } = await httpRequest('http://localhost:3010/server-method', {
					method: 'post',
					headers: {
						'Content-Type': 'application/json',
						'x-server-method-id': 'server-method-component.returnParameter',
					},
					body: JSON.stringify({ context: {}, args: ['MOCHA', 'TEST'] }),
				});

				assert.equal(response.json.parameter, 'MOCHA');
				assert.equal(response.json.secondParameter, 'TEST');
			});

			it('invokes the function with the correct context', async function () {
				const { response } = await httpRequest('http://localhost:3010/server-method', {
					method: 'post',
					headers: {
						'Content-Type': 'application/json',
						'x-server-method-id': 'server-method-component.returnContext',
					},
					body: JSON.stringify({ context: { foo: 'bar' }, args: [] }),
				});

				assert.equal(response.json.context, 'bar');
			});

			it('does not invoke a function that is not marked as invokable', async function () {
				const { response } = await httpRequest('http://localhost:3010/server-method', {
					method: 'post',
					headers: {
						'Content-Type': 'application/json',
						'x-server-method-id': 'server-method-component.notInvokable',
					},
					body: JSON.stringify({ context: {}, args: [] }),
				});

				assert.equal(response.json.foo, undefined);
			});
		});
	});
};
