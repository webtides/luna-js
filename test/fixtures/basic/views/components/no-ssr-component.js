import {Component} from "@webtides/luna-js";

@Component({
    target: Component.TARGET_CLIENT,
})
export default class NoSsrComponent {

    get template() {
        return `
            NO SSR COMPONENT
            
            <client-component></client-component>
        `;
    }
}
