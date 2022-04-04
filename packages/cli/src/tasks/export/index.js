import { generateStaticSite } from './static-site-generator';
import { buildComponentsForApplication } from '../build/application';
import ComponentLoader from '@webtides/luna-js/src/framework/loaders/component-loader';

export default async () => {
	await buildComponentsForApplication();
	await generateStaticSite();
};
