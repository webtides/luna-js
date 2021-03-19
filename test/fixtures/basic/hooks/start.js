import {HOOKS} from "../../../../packages/luna/src/framework/hooks/definitions";

const name = HOOKS.SERVER_STARTED;
export { name };

export default async () => {
    console.log("HOOKS.SERVER_STARTED");
};
