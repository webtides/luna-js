import {Component} from "@webtides/luna-js";

@Component({
    ssr: false,
    csr: true,
})
export default class NoSsrComponent {

    template() {
        return html`
            NO SSR COMPONENT
            
            <client-component></client-component>
        `;
    }
}
