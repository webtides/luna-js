import {Component} from "@webtides/luna-js";

@Component({
    server: false,
    client: true,
})
export default class NoSsrComponent {

    get template() {
        return `
            NO SSR COMPONENT
            
            <client-component></client-component>
        `;
    }
}
