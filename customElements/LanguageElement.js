class LanguageElement extends HTMLElement {

    static observedAttributes = ["path"];

    constructor() {
        super(arguments);
    }

    connectedCallback() {
        this.innerHTML = lang.get(this.getAttribute("path"));

        lang.addUpdater(()=>{
            this.innerHTML = lang.get(this.getAttribute("path"));
        });

    }

    attributeChangedCallback(name, oldValue, newValue) {
        this.innerText = lang.get(newValue);
    }
      
}

customElements.define("language-element", LanguageElement);
