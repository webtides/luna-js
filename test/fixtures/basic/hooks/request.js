import {HOOKS} from "../../../../packages/luna/src/framework/hooks/definitions";

const name = HOOKS.REQUEST_RECEIVED;
export { name };

export default async ({ request }) => {
    console.log("HOOKS.REQUEST_RECEIVED");
};
