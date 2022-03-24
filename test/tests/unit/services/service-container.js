import LunaContainer from '../../../../packages/luna/src/framework/luna';
import ServiceContext from '../../../../packages/luna/src/framework/services/service-context';
import { chai } from '../../../helpers';
import ServiceContainer from '../../../../packages/luna/src/framework/services/service-container';
import { CurrentRequest, LunaService } from '../../../../packages/luna';

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

		chai.expect(serviceDefinitions.length).to.be.gt(0);

		for (const serviceDefinition of serviceDefinitions) {
			const service = global.luna.get(serviceDefinition);

			chai.expect(service).to.not.equal(false);
			chai.expect(service).to.equal(ServiceContainer.get(serviceDefinition));
		}
	});

	it('should set the $$luna context in the service definition', () => {
		@LunaService({ name: 'exampleService' })
		class ExampleService {}

		chai.expect(ExampleService.$$luna.serviceName).to.equal('exampleService');
	});

	it('should inject the $$luna context inside a service', () => {
		@LunaService({ name: 'exampleService' })
		class ExampleService {}

		global.luna.set(ExampleService, new ExampleService());

		const serviceContext = new ServiceContext();
		const serviceInstance = serviceContext.get(ExampleService);

		chai.expect(serviceInstance).to.not.equal(false);
		chai.expect(serviceInstance.$$luna).to.not.be.undefined;
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

		chai.expect(serviceInstance).to.not.equal(false);
		chai.expect(serviceInstance.getRequest()).to.equal('mock');
	});
});
