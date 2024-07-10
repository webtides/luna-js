import { assertFileContains, assertFileNotContains } from '../../helpers/index.js';
import assert from 'node:assert';

export const basicDecoratorsTest = () => {
	describe('Luna decorators test', () => {
		describe('Build test', () => {
			it('removes the method annotated with HideFromClient from the client bundle', () => {
				assertFileContains('.build/generated/application/decorator-component.js', 'PSST. Secret Message.');
				assertFileNotContains('.build/public/assets/decorator-component.js', 'PSST. Secret Message.');
			});

			it('removes the class content from a class annotated with HideFromClient from the client bundle', () => {
				assertFileContains('.build/generated/application/decorator-component.js', "Don't tell!!!");
				// Tests standard class definition
				assertFileNotContains('.build/public/assets/decorator-component.js', "Don't tell!!!");
				// Tests default export class
				assertFileNotContains('.build/public/assets/decorator-component.js', 'App secret');
				// Test if the class definition is not there to prevent leaking of class names
				assertFileNotContains('.build/public/assets/decorator-component.js', 'class SecretClass {}');
			});
		});

		describe('Service decorators test', () => {
			it('adds metadata to the annotated service class', async () => {
				await import('../../../packages/luna/src/framework/bootstrap.js');
				const { LunaService } = await import('../../../packages/luna/src/decorators/service.js');

				@LunaService({
					name: 'TestService',
				})
				class TestService {}

				@LunaService({
					as: TestService,
				})
				class ConcreteTestService {}

				assert.equal(TestService.$$luna.serviceName, 'TestService');
				assert.equal(ConcreteTestService.$$luna.serviceName, 'TestService');
			});
		});
	});
};
