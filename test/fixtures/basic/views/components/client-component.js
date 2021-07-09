import {Component} from "@webtides/luna-js";

@Component({
    csr: true,
})
export default class ClientComponent {

    get template() {
        return `
            CLIENT COMPONENT
        `;
    }
}
