import { HOOKS } from '../../../../packages/luna/src/framework/hooks/definitions';

const name = HOOKS.LUNA_INITIALIZE;
export { name };

export default async ({ luna }) => {
	console.log('HOOKS.LUNA_INITIALIZE');
	return luna;
};
