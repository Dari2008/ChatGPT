class LanguageToggleElement extends HTMLElement {

    static get observedAttributes() {
        return ["langCode", "toggled"];
    }

    constructor() {
        super();
        this.image = document.createElement("div");
        this.image.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="currentColor"></path></svg>';

    }

    connectedCallback() {
        if (this.toggleElementMainDiv) {
            this.toggleElementMainDiv.remove();
        }
        let langCode = this.getAttribute('langCode');
        let image = LanguageElementData.data[langCode].image;

        this.toggleElementMainDiv = document.createElement('div');
        this.toggleElementMainDiv.classList.add('toggle');
        this.toggleElementMainDiv.setAttribute('role', 'toggle');
        this.toggleElementMainDiv.setAttribute('langCode', langCode);

        this.toggleElement = document.createElement('div');
        this.toggleElement.classList.add('toggleButton');
        this.toggleElement.setAttribute('name', langCode);
        this.toggleElement.onclick = ()=>{
            this.dispatchEvent(new CustomEvent('toggle', { detail: {lang: langCode, element:this} }));
        };
        this.toggleElementMainDiv.onclick = ()=>{
            this.dispatchEvent(new CustomEvent('toggle', { detail: {lang: langCode, element:this} }));
        };

        this.addEventListener("click", this.toggle);
        this.toggleElement.appendChild(this.image);

        let data = document.createElement('div');
        data.classList.add('data');

        let langName = document.createElement('span');
        langName.classList.add('langName');
        langName.innerHTML = lang.get("languageNames.names." + LanguageElementData.data[langCode].shortCode);

        let local = document.createElement('div');
        local.classList.add('local');

        let localName = document.createElement('span');
        localName.classList.add('localName');
        localName.innerHTML = LanguageElementData.ownNames[langCode];

        lang.addUpdater(()=>{
            langName.innerHTML = lang.get("languageNames.names." + LanguageElementData.data[langCode].shortCode);
        });


        let localFlag = document.createElement('img');
        localFlag.classList.add('localFlag');
        localFlag.src = image;

        local.appendChild(localName);
        local.appendChild(localFlag);

        data.appendChild(langName);
        data.appendChild(local);

        this.toggleElementMainDiv.appendChild(this.toggleElement);
        this.toggleElementMainDiv.appendChild(data);

        this.appendChild(this.toggleElementMainDiv);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name == "langCode") {
            this.connectedCallback();
        } else if (name == "toggled") {
            this.updateImage();
        }
    }

    isToggled() {
        return this.hasAttribute("toggled");
    }

    updateImage() {
        
        if (this.isToggled()) {
            this.image.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="currentColor"></path><circle cx="12" cy="12" r="5" fill="currentColor"></circle></svg>';
        } else {
            this.image.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="currentColor"></path></svg>';
        }
    }

    toggle() {
        if (this.hasAttribute("toggled")) {
            this.removeAttribute("toggled");
        } else {
            this.setAttribute("toggled", "");
        }
        this.updateImage();
    }

}

customElements.define('language-toggle-element', LanguageToggleElement);


document.addEventListener('documentLoaded', ()=>{
    let style = document.createElement('style');
    style.textContent = `
    language-toggle-element:not([toggled]) .toggleButton{
      border-radius: 100%;
      aspect-ratio: 1/1;
      border: none;
      color: white;
      width: 25px;
      display: block;
      background-image: url('data:image/svg+xml;utf8,');
    }

    language-toggle-element[toggled] .toggleButton{
      background-image: url('data:image/svg+xml;utf8,');
    }

    `;
    document.body.appendChild(style);

});