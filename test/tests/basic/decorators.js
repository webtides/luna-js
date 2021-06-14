const { chai, sleep } = require("../../helpers");
const fs = require("fs");

describe("Luna decorators test", function() {
    this.timeout(10000);

    describe("Build test", () => {
        it("removes the method annotated with HideFromClient from the client bundle", () => {
            const serverFileContents = fs.readFileSync('.build/generated/application/decorator-component.js', 'UTF-8');
            chai.expect(serverFileContents).to.include('PSST. Secret Message.');

            const clientFileContents = fs.readFileSync('.build/public/assets/decorator-component.js', 'UTF-8');
            chai.expect(clientFileContents).to.not.include('PSST. Secret Message.');
        });

        it("removes the class content from a class annotated with HideFromClient from the client bundle", () => {
            const serverFileContents = fs.readFileSync('.build/generated/application/decorator-component.js', 'UTF-8');
            chai.expect(serverFileContents).to.include('Don\'t tell!!!');

            const clientFileContents = fs.readFileSync('.build/public/assets/decorator-component.js', 'UTF-8');
            // Tests standard class definition
            chai.expect(clientFileContents).to.not.include("Don't tell!!!");
            // Tests default export class
            chai.expect(clientFileContents).to.not.include("App secret");
            // Test if the class definition is not there to prevent leaking of class names
            chai.expect(clientFileContents).to.not.include(`class SecretClass {}`);
        });
    });

    describe("Service decorators test", () => {
        it("adds metadata to the annotated service class", () => {
            require("../../../packages/luna/src/framework/bootstrap");
            const {LunaService} = require("../../../packages/luna/src/decorators/service");

            @LunaService({
                name: 'TestService'
            })
            class TestService { }

            @LunaService({
                as: TestService
            })
            class ConcreteTestService {}

            chai.expect(TestService.$$luna.serviceName).to.equal('TestService');
            chai.expect(ConcreteTestService.$$luna.serviceName).to.equal('TestService');
        });

        // TODO: needs option to pass luna config from outside and not from file
        // it("injects a luna service", async () => {
        //     await prepareLuna();
        //
        //     class Element {
        //         @Inject(DocumentRenderer) documentRenderer;
        //     }
        //
        //     const element = new Element();
        //     console.log(element.documentRenderer);
        // });
    });
});
