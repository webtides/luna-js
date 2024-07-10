import { httpRequest, assertContains } from '../../../helpers/index.js';
import assert from 'node:assert';

const basic = () => {
	it('should register the index api route', async function () {
		const { response } = await httpRequest('http://localhost:3010/api');
		assert.equal(response.status, 200);
		assertContains(response.headers.get('content-type'), 'application/json');
		assert.equal(response.json.success, true);
	});

	it('should register routes with parameters', async function () {
		const id = Math.random() * 100;
		const { response } = await httpRequest(`http://localhost:3010/api/users/${id}`);
		assert.equal(response.json.id, id);
	});

	it('should be able to get/post/put/delete to the same route', async function () {
		const id = Math.random() * 100;

		let result = await httpRequest(`http://localhost:3010/api/users/${id}`, {
			method: 'get',
		});

		assert.equal(result.response.json.id, id);
		assert.equal(result.response.json.post, false);

		result = await httpRequest(`http://localhost:3010/api/users/${id}`, {
			method: 'post',
		});

		assert.equal(result.response.json.id, id);
		assert.equal(result.response.json.post, true);

		result = await httpRequest(`http://localhost:3010/api/users/${id}`, {
			method: 'put',
		});

		assert.equal(result.response.json.id, id);
		assert.equal(result.response.json.put, true);

		result = await httpRequest(`http://localhost:3010/api/users/${id}`, {
			method: 'delete',
		});

		assert.equal(result.response.json.id, id);
		assert.equal(result.response.json.delete, true);
	});

	it('should use the fallback api route the /api/foo route', async function () {
		const { response } = await httpRequest(`http://localhost:3010/api/foo`);
		assert.equal(response.status, 200);
		assertContains(response.json.result, 'MOCHA FALLBACK API');
	});
};

export { basic };
