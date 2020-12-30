import './bootstrap.js';

import {generateStaticSite} from "./engine/static-site-generator";
import {registerAvailableComponents} from "./loaders/component-loader";

(async () => {
    await registerAvailableComponents();
    await generateStaticSite();
})();

