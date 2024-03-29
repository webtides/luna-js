const {chai} = require('../../helpers');

describe('Luna routes test', function () {
	before(async function () {
		process.chdir(global.getCurrentWorkingDirectory('basic'));
		global.originalConsoleLog = console.log;
		const { startLuna } = require('../../../packages/luna/src/framework');
		await startLuna();
	});

	after(async function () {
		const { stopLuna } = require('../../../packages/luna/src/framework');
		await stopLuna();
		console.log = global.originalConsoleLog;
	});

	describe('Special cases', function () {
		it('should use the fallback route the /foo route', async function () {
			const response = await chai.request('http://localhost:3010').get('/foo').send();
			chai.expect(response.status).to.be.equal(200);
			chai.expect(response.text).to.include('MOCHA FALLBACK PAGE');
		});
	});

	describe('Index page', function () {
		it('registers the index route', async function () {
			const response = await chai.request('http://localhost:3010').get('/').send();
			chai.expect(response.status).to.be.equal(200);
		});

		it('has the "text/html" content type', async function () {
			const response = await chai.request('http://localhost:3010').get('/').send();
			chai.expect(response.headers['content-type']).to.contain('text/html');
		});

		it('prints "HELLO MOCHA" on the index page', async function () {
			const response = await chai.request('http://localhost:3010').get('/').send();
			chai.expect(response.text).to.be.an('string').that.does.include('HELLO MOCHA');
		});
	});

	describe('Page with parameters', function () {
		it('registers a route with a parameter', async function () {
			const response = await chai.request(`http://localhost:3010`).get('/params/test').send();
			chai.expect(response.status).to.be.equal(200);
		});

		it('prints the dynamic parameter on the screen', async function () {
			const randomParameter = Math.random() * 100;

			let response = await chai.request(`http://localhost:3010`).get(`/params/${randomParameter}`).send();
			chai.expect(response.status).to.be.equal(200);
			chai.expect(response.text).to.include(`ID: ${randomParameter}`);

			const secondRandomParameter = Math.random() * 1000;

			response = await chai.request(`http://localhost:3010`).get(`/params/${secondRandomParameter}`).send();
			chai.expect(response.status).to.be.equal(200);
			chai.expect(response.text).to.include(`ID: ${secondRandomParameter}`);
		});

		it('registers the routes with no parameters more early', async function () {
			let response = await chai.request(`http://localhost:3010`).get('/params/existing').send();
			chai.expect(response.status).to.be.equal(200);
			chai.expect(response.text).to.include(`NO PARAMETER`);
		});
	});

	describe('Page with layout', function () {
		it('uses the defined layout', async function () {
			let response = await chai.request(`http://localhost:3010`).get('/layout').send();
			chai.expect(response.text).to.include(`MOCHA LAYOUT`);
		});

		it('uses the context in the layout', async function () {
			let response = await chai.request(`http://localhost:3010`).get('/layout').send();
			chai.expect(response.text).to.include(`MOCHA CONTEXT`);
		});
	});

	describe('Page with middleware', function () {
		it('registers the defined middleware', async function () {
			let response = await chai.request(`http://localhost:3010`).get('/middleware').send();
			chai.expect(response.status).to.equal(200);
			chai.expect(response.headers['luna-middleware']).to.equal('works');
		});

		it('does not register middleware for other routes', async function () {
			let response = await chai.request(`http://localhost:3010`).get('/').send();
			chai.expect(response.headers['luna-middleware']).to.be.undefined;
		});
	});

	describe('Page with markdown import', function () {
		it('correctly loads the markdown import', async function () {
			let response = await chai.request(`http://localhost:3010`).get('/markdown').send();

			chai.expect(response.text).to.include(`SUCCESS`);
			chai.expect(response.text).to.include(`I am a <strong>markdown</strong> text.`);
		});
	});

	describe('Page with redirect', function () {
		it('correctly performs the redirect', async function() {
			const response = await chai.request(`http://localhost:3010`)
				.get('/redirect/component')
				.send();

			chai.expect(response.text).to.be.an('string').that.does.include('HELLO MOCHA');
		});

		it('correctly performs the redirect with a component page', async function () {
			const response = await chai.request(`http://localhost:3010`)
				.get('/redirect/component')
				.send();

			chai.expect(response.text).to.be.an('string').that.does.include('HELLO MOCHA');
		});
	});

	describe('Route cache', function () {
		before(() => {
			const MemoryCache = require('../../../packages/luna/src/framework/cache/memory-cache').default;

			class TestCache extends MemoryCache {
				async get(key, group = 'default', defaultValue = false) {
					console.log('Cache hit', {group, key});
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

			const response = await chai.request(`http://localhost:3010`).get('/cache').send();
			const secondResponse = await chai.request(`http://localhost:3010`).get('/cache').send();

			chai.expect(response.statusCode).to.be.equal(200);
			chai.expect(secondResponse.statusCode).to.be.equal(200);
			chai.expect(count).to.equal(1);
		});
	});
});
