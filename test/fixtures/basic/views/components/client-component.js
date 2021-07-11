import {Component} from "@webtides/luna-js";

@Component({
    client: true,
})
export default class ClientComponent {

    get template() {
        return `
            CLIENT COMPONENT
        `;
    }
}
