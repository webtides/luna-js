import {sleep, execute, BUILD_SCRIPT, LUNA_CLI_SCRIPT, chai} from '../../helpers/index.js';

export const basicComponentsTest = () => {
	describe('Luna element test', function () {
		before(async function () {
			process.chdir(global.getCurrentWorkingDirectory('basic'));
			const { startLuna } = await import('../../../packages/luna/src/framework/index.js');
			global.originalConsoleLog = console.log;
			await startLuna();
		});

		after(async function () {
			const { stopLuna } = await import('../../../packages/luna/src/framework/index.js');
			await stopLuna();
			console.log = global.originalConsoleLog;
		});

		describe('Basic component tests', function () {
			it('renders the component on the server', async function () {
				const response = await chai.request('http://localhost:3010').get('/rendering').send();
				chai.expect(response.text).to.include('MOCHA COMPONENT');
			});

			it("doesn't render the no-ssr-component on the server", async function () {
				const response = await chai.request('http://localhost:3010').get('/rendering').send();
				chai.expect(response.text).to.not.include('NO SSR COMPONENT');
				chai.expect(response.text).to.include('<no-ssr-component');
			});

			it('loads the dependencies of no ssr components', async function () {
				const response = await chai.request('http://localhost:3010').get('/rendering').send();
				chai.expect(response.text).to.include('/client-component.js');
			});

			it('renders the properties correctly', async function () {
				const response = await chai.request('http://localhost:3010').get('/rendering/properties').send();
				chai.expect(response.text).to.include('PROPERTY COMPONENT MOCHA');
				chai.expect(response.text).to.not.include('DASH-MOCHA');
				chai.expect(response.text).to.include('CAMEL-MOCHA');
			});
		});

		describe('Special cases', function () {
			it('correctly performs the redirect', async function () {
				const response = await chai.request(`http://localhost:3010`)
					.get('/redirect/component')
					.send();

				chai.expect(response.text).to.be.an('string').that.does.include('HELLO MOCHA');
			});
		});

		describe('Different method contexts', function () {
			it('invokes the function with the correct parameters', async function () {
				const response = await chai.request(`http://localhost:3010`)
					.post('/server-method')
					.set('x-server-method-id', `server-method-component.returnParameter`)
					.send({context: {}, args: ['MOCHA', 'TEST']});

				chai.expect(response.body.parameter).to.equal('MOCHA');
				chai.expect(response.body.secondParameter).to.equal('TEST');
			});

			it('invokes the function with the correct context', async function () {
				const response = await chai.request(`http://localhost:3010`)
					.post('/server-method')
					.set('x-server-method-id', `server-method-component.returnContext`)
					.send({context: {foo: 'bar'}, args: []});

				chai.expect(response.body.context).to.equal('bar');
			});

			it('does not invoke a function that is not marked as invokable', async function () {
				const response = await chai.request(`http://localhost:3010`)
					.post('/server-method')
					.set('x-server-method-id', `server-method-component.notInvokable`)
					.send({context: {}, args: []});

				chai.expect(response.body.foo).to.be.undefined;
			});
		})
	});
};
