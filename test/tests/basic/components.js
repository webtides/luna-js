const { chai, sleep } = require('../../helpers');

describe('Luna element test', function () {
	this.timeout(10000);

	before(async function () {
		process.chdir(global.getCurrentWorkingDirectory('basic'));

		const { startLuna } = require('../../../packages/luna/src/framework');

		global.originalConsoleLog = console.log;
		await startLuna();

		await sleep(600);
	});

	after(async function () {
		const { stopLuna } = require('../../../packages/luna/src/framework');
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

	describe('Different method contexts', function() {
		it('invokes the function in the correct context', function() {
			console.log = (text) => {
				if (text.startsWith('TEST MOCHA')) {
					done();
				}

				global.originalConsoleLog(...arguments);
			};


			chai.request(`http://localhost:3010`)
				.get('/server-method')
				.send();
		})
	})
});
