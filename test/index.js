import serviceContainerTests from './tests/unit/services/service-container.js';
import baseRendererTests from './tests/unit/renderers/base.js';
import elementJsRendererTest from './tests/unit/renderers/element-js.js';
import litRendererTest from './tests/unit/renderers/lit.js';
import emptyBuildTest from './tests/empty.js';
import basicBuildTest from './tests/basic.js';

global.previousWorkingDirectory = process.cwd();

global.getCurrentWorkingDirectory = (fixture) => {
	return global.previousWorkingDirectory + '/test/fixtures/' + fixture;
};

serviceContainerTests();
baseRendererTests();
elementJsRendererTest();
litRendererTest();
emptyBuildTest();
basicBuildTest();
