import {HideFromClient} from "@webtides/luna-js";

@HideFromClient
export default class SecretService {
    getSecret() {
        return "App secret";
    }
}
