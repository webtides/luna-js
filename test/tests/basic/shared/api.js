import { chai } from '../../../helpers/index.js';

const basic = () => {
	it('should register the index api route', async function () {
		const response = await chai.request('http://localhost:3010').get('/api').send();

		chai.expect(response.status).to.be.equal(200);
		chai.expect(response.headers['content-type']).to.include('application/json');
		chai.expect(response.body.success).to.be.true;
	});

	it('should register routes with parameters', async function () {
		const id = Math.random() * 100;
		const response = await chai.request('http://localhost:3010').get(`/api/users/${id}`).send();

		chai.expect(+response.body.id).to.be.equal(id);
	});

	it('should be able to get/post/put/delete to the same route', async function () {
		const id = Math.random() * 100;
		let response = await chai.request('http://localhost:3010').get(`/api/users/${id}`).send();

		chai.expect(+response.body.id).to.be.equal(id);
		chai.expect(response.body.post).to.be.false;

		response = await chai.request('http://localhost:3010').post(`/api/users/${id}`).send();

		chai.expect(+response.body.id).to.be.equal(id);
		chai.expect(response.body.post).to.be.true;

		response = await chai.request('http://localhost:3010').put(`/api/users/${id}`).send();

		chai.expect(+response.body.id).to.be.equal(id);
		chai.expect(response.body.put).to.be.true;

		response = await chai.request('http://localhost:3010').delete(`/api/users/${id}`).send();

		chai.expect(+response.body.id).to.be.equal(id);
		chai.expect(response.body.delete).to.be.true;
	});

	it('should use the fallback api route the /api/foo route', async function () {
		const response = await chai.request('http://localhost:3010').get('/api/foo').send();
		chai.expect(response.status).to.be.equal(200);
		chai.expect(response.body.result).to.equal('MOCHA FALLBACK API');
	});
};

export { basic };
