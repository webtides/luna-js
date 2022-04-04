import { HOOKS } from '../../../../packages/luna/src/framework/hooks/definitions';

const name = HOOKS.COMPONENTS_LOADED;
export { name };

export default async () => {
	console.log('HOOKS.COMPONENTS_LOADED');
};
