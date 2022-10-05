import {basicCliTest} from "./basic/cli.js";
import {basicDecoratorsTest} from "./basic/decorators.js";
import {basicRoutesTest} from "./basic/routes.js";
import {basicApiTest} from "./basic/api.js";
import {basicComponentsTest} from "./basic/components.js";
import {basicHooksTest} from "./basic/hooks.js";
import {basicExportTest} from "./basic/export.js";


const basicTest = () => {
	basicCliTest();
	basicDecoratorsTest();
	basicRoutesTest();
	basicApiTest();
	basicComponentsTest();
	basicHooksTest();
	basicExportTest();
}

export default basicTest;
