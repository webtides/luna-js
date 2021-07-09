import {HideFromClient} from "@webtides/luna-js";
import SecretService from "../../app/secret-service";

@HideFromClient
class SecretClass {
    constructor() {
        console.log("Don't tell!!!");
    }
}

export default class DecoratorComponent{
    publicMethod() {
        console.log(SecretClass, SecretService);
    }

    @HideFromClient
    mySecretMethod() {
        console.log("PSST. Secret Message.");
    }

    template() {
        return ``;
    }
}
