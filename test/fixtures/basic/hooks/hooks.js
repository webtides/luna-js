import {HOOKS} from "../../../../packages/luna/src/framework/hooks/definitions";

const name = HOOKS.HOOKS_LOADED;
export { name };

export default async () => {
    console.log("HOOKS.HOOKS_LOADED");
};
