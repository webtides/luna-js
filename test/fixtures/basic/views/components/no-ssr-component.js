import {Component} from "@webtides/luna-js";

@Component({
    ssr: false,
    csr: true,
})
export default class NoSsrComponent {

    get template() {
        return `
            NO SSR COMPONENT
            
            <client-component></client-component>
        `;
    }
}
