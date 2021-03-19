import {HOOKS} from "../../../../packages/luna/src/framework/hooks/definitions";

const name = HOOKS.ROUTES_BEFORE_REGISTER;
export { name };

export default async () => {
    console.log("HOOKS.ROUTES_BEFORE_REGISTER");
};
