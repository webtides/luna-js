import {HOOKS} from "../../../../packages/luna/src/framework/hooks/definitions";

const name = HOOKS.ROUTES_AFTER_REGISTER;
export { name };

export default async () => {
    console.log("HOOKS.ROUTES_AFTER_REGISTER");
};
