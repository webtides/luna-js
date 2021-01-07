
            // TODO: use core-js in near future
            Object.defineProperty(Array.prototype, "includes", {
                value: function(searchElement, fromIndex) {
                    return this.indexOf(searchElement) !== -1;
                }
            });
        
                   import ProfileComponent from "/assets/profile-component.js";
                   customElements.define("profile-component", ProfileComponent);
               

                   import ResultComponent from "/assets/result-component.js";
                   customElements.define("result-component", ResultComponent);
               

                   import SearchComponent from "/assets/search-component.js";
                   customElements.define("search-component", SearchComponent);
               