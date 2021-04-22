
const { chai, sleep } = require("../../helpers");

describe("Luna routes test", function() {
    this.timeout(20000);

    before(async function() {
        process.chdir(global.getCurrentWorkingDirectory('basic'));

        global.originalConsoleLog = console.log;

        const { startServer } = require("../../../packages/luna/lib/framework");
        await startServer();

        await sleep(600);

        console.log("STARTED THE SERVER");
    });

    after(async function() {
        const { stopServer } = require("../../../packages/luna/lib/framework");
        await stopServer();

        console.log = global.originalConsoleLog;
    });

    describe("Special cases", function() {
        it("should use the fallback route the /foo route", async function() {
            const response = await chai.request('http://localhost:3010').get('/foo').send();
            chai.expect(response.status).to.be.equal(200);
            chai.expect(response.text).to.include("MOCHA FALLBACK PAGE");
        });
    })

    describe("Index page", function() {
        it("registers the index route", async function() {
            const response = await chai.request('http://localhost:3010').get('/').send();
            chai.expect(response.status).to.be.equal(200);
        });

        it('has the "text/html" content type', async function() {
            const response = await chai.request('http://localhost:3010').get('/').send();
            chai.expect(response.headers['content-type']).to.contain('text/html')
        });

        it('prints "HELLO MOCHA" on the index page', async function() {
            const response = await chai.request('http://localhost:3010').get('/').send();
            chai.expect(response.text).to.be.an('string').that.does.include('HELLO MOCHA');
        });
    });

    describe("Component page", function() {
        it('registers a component page', async function() {
            const response = await chai.request(`http://localhost:3010`).get('/component').send();
            chai.expect(response.status).to.be.equal(200);
        });

        it('loads static properties', async function() {
            const response = await chai.request(`http://localhost:3010`).get('/component').send();
            chai.expect(response.text).to.contain("MOCHA STATIC PROPERTY");
        });

        it('loads dynamic properties', async function() {
            const response = await chai.request(`http://localhost:3010`).get('/component').send();
            chai.expect(response.text).to.contain("MOCHA DYNAMIC PROPERTY");
        });
    })

    describe("Page with parameters", function() {
       it('registers a route with a parameter', async function() {
           const response = await chai.request(`http://localhost:3010`).get('/params/test').send();
           chai.expect(response.status).to.be.equal(200);
       });

       it('prints the dynamic parameter on the screen', async function() {
           const randomParameter = Math.random() * 100;

           let response = await chai.request(`http://localhost:3010`).get(`/params/${randomParameter}`).send();
           chai.expect(response.status).to.be.equal(200);
           chai.expect(response.text).to.include(`ID: ${randomParameter}`);

           const secondRandomParameter = Math.random() * 1000;

           response = await chai.request(`http://localhost:3010`).get(`/params/${secondRandomParameter}`).send();
           chai.expect(response.status).to.be.equal(200);
           chai.expect(response.text).to.include(`ID: ${secondRandomParameter}`);
       });

       it('registers the routes with no parameters more early', async function() {
           let response = await chai.request(`http://localhost:3010`).get('/params/existing').send();
           chai.expect(response.status).to.be.equal(200);
           chai.expect(response.text).to.include(`NO PARAMETER`);
       });
    });

    describe("Page with layout", function() {
        it('uses the defined layout', async function() {
            let response = await chai.request(`http://localhost:3010`).get('/layout').send();
            chai.expect(response.text).to.include(`MOCHA LAYOUT`);
        });

        it('uses the context in the layout', async function() {
            let response = await chai.request(`http://localhost:3010`).get('/layout').send();
            chai.expect(response.text).to.include(`MOCHA CONTEXT`);
        });

        it('uses the component as context in the layout', async function() {
            let response = await chai.request(`http://localhost:3010`).get('/layout/component').send();
            chai.expect(response.text).to.include(`MOCHA COMPONENT CONTEXT`);
        });
    });

    describe("Page with middleware", function() {
        it('registers the defined middleware', async function() {
            let response = await chai.request(`http://localhost:3010`).get('/middleware').send();
            chai.expect(response.status).to.equal(200);
            chai.expect(response.headers['luna-middleware']).to.equal('works');
        });

        it('does not register middleware for other routes', async function() {
            let response = await chai.request(`http://localhost:3010`).get('/').send();
            chai.expect(response.headers['luna-middleware']).to.be.undefined;
        });
    });

    describe("Route cache", function() {
        before(() => {
            const MemoryCache = require("../../../packages/luna/lib/framework/cache/memory-cache").default;

            class TestCache extends MemoryCache {
                async get(key, group = 'default', defaultValue = false) {
                    console.log('Cache hit', { group, key });
                    return super.get(key, group, defaultValue);
                }
            }

            luna.set('Cache', new TestCache());
        });

        it('caches the route on the second request', async function() {
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
    })
});
