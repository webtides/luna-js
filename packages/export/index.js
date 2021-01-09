import '../framework/bootstrap.js';

import {generateStaticSite} from "./static-site-generator";
import {registerAvailableComponents} from "../framework/loaders/component-loader";

export default async () => {
    await registerAvailableComponents();
    await generateStaticSite();
};
