import LunaContainer from '../../../../packages/luna/src/framework/luna.js';
import ServiceContext from '../../../../packages/luna/src/framework/services/service-context.js';
import ServiceContainer from '../../../../packages/luna/src/framework/services/service-container.js';
import { CurrentRequest, LunaService } from '../../../../packages/luna/index.js';
import assert from 'node:assert';

export default () => {
	describe('Service container test', function () {
		before(async () => {
			const luna = new LunaContainer({});
			await luna.prepare();

			global.luna = luna;
		});

		after(() => {
			global.luna = null;
		});

		it('should receive all default services from the service container', () => {
			const serviceDefinitions = global.luna.serviceDefaults;

			assert.ok(serviceDefinitions.length > 0, 'value should be greater than 0');

			for (const serviceDefinition of serviceDefinitions) {
				const service = global.luna.get(serviceDefinition);

				assert.notEqual(service, false);
				assert.equal(service, ServiceContainer.get(serviceDefinition));
			}
		});

		it('should set the $$luna context in the service definition', () => {
			@LunaService({ name: 'exampleService' })
			class ExampleService {}

			assert.equal(ExampleService.$$luna.serviceName, 'exampleService');
		});

		it('should inject the $$luna context inside a service', () => {
			@LunaService({ name: 'exampleService' })
			class ExampleService {}

			global.luna.set(ExampleService, new ExampleService());

			const serviceContext = new ServiceContext();
			const serviceInstance = serviceContext.get(ExampleService);

			assert.notEqual(serviceInstance, false);
			assert.ok(serviceInstance.$$luna);
		});

		it('should inject the current request from the service context', () => {
			@LunaService({ name: 'exampleService' })
			class ExampleService {
				@CurrentRequest request;

				getRequest() {
					return this.request;
				}
			}

			global.luna.set(ExampleService, new ExampleService());

			const serviceContext = new ServiceContext({ $$luna: { request: 'mock' } });
			const serviceInstance = serviceContext.get(ExampleService);

			assert.notEqual(serviceInstance, false);
			assert.equal(serviceInstance.getRequest(), 'mock');
		});
	});
};
