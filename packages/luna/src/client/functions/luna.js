import LunaBase from "../../framework/shared/luna-base";

(function() {
    window.luna = new LunaBase(window.lunaConfig);

    // A simple polyfill to attach declarative shadow dom if the browser does not natively support them.
    const attachDeclarativeShadowDOMs = () => {
        const templates = document.querySelectorAll('template[shadowroot]');

        templates.forEach((template) => {
            const mode = template.getAttribute('shadowroot');
            const shadowRoot = template.parentElement.attachShadow({ mode });

            shadowRoot.appendChild(template.content);
            template.remove();
        });
    };

    attachDeclarativeShadowDOMs();
})();
