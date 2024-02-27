import { generateStaticSite } from './static-site-generator.js';
import { buildComponentsForApplication } from '../build/application.js';

export default async () => {
	await buildComponentsForApplication();
	await generateStaticSite();
};
