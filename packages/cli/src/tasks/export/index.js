import {generateStaticSite} from "./static-site-generator";
import {buildComponentsForApplication} from "../build/application";
import ComponentLoader from "@webtides/luna-js/lib/framework/loaders/component-loader";

export default async () => {
    await buildComponentsForApplication();
    await luna.get(ComponentLoader).registerAvailableComponents();
    await generateStaticSite();
};
