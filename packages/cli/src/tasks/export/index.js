import {generateStaticSite} from "./static-site-generator";
import {buildComponentsForApplication} from "../build/application";
import {ServiceDefinitions} from "@webtides/luna-js/lib/framework/services";

export default async () => {
    await buildComponentsForApplication();
    await luna.get(ServiceDefinitions.ComponentLoader).registerAvailableComponents();
    await generateStaticSite();
};
