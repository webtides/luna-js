import { HOOKS } from '../../../../packages/luna/src/framework/hooks/definitions';

const name = HOOKS.MIDDLEWARE_REGISTER;
export { name };

export default async ({ app }) => {
	console.log('HOOKS.MIDDLEWARE_REGISTER');
};
