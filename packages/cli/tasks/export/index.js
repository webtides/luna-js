import '../../../framework/bootstrap.js';

import {generateStaticSite} from "./static-site-generator";
import {registerAvailableComponents} from "../../../framework/loaders/component-loader";
import {buildComponentsForApplication} from "../build/application";

export default async () => {
    await buildComponentsForApplication();
    await registerAvailableComponents();
    await generateStaticSite();
};
