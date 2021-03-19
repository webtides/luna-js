import {registerAvailableComponents} from "@webtides/luna-js/lib/framework/loaders/component-loader";

import {generateStaticSite} from "./static-site-generator";
import {buildComponentsForApplication} from "../build/application";

export default async () => {
    await buildComponentsForApplication();
    await registerAvailableComponents();
    await generateStaticSite();
};
