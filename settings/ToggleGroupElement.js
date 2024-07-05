class ToggleGroupElement extends HTMLElement{
    constructor() {
        super(arguments);
        this.toggleElements = [];
        this._selectedElement = null;
    }

    connectedCallback() {
        let observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if(mutation.type != 'childList')return;
                if (mutation.addedNodes.length > 0) {
                    if(mutation.target.role == 'toggle') {
                        if(mutation.target.tagName == 'TOGGLE-ELEMENT' || mutation.target.children[i].tagName == 'LANGUAGE-TOGGLE-ELEMENT'){
                            if(this.toggleElements.indexOf(mutation.target) == -1){
                                this.addToggleElement(mutation.target);
                            }
                        }else if(mutation.target.tagName === 'DIV'){
                            for(let i = 0; i < mutation.target.children.length; i++){
                                if(mutation.target.children[i].tagName == 'TOGGLE-ELEMENT' || mutation.target.children[i].tagName == 'LANGUAGE-TOGGLE-ELEMENT'){
                                    if(this.toggleElements.indexOf(mutation.target.children[i]) == -1){
                                        this.addToggleElement(mutation.target.children[i]);
                                    }
                                }
                            }
                        }
                    }else{
                        for(let i = 0; i < mutation.addedNodes.length; i++){
                            if(mutation.addedNodes[i].tagName){
                                if(mutation.addedNodes[i].tagName == 'TOGGLE-ELEMENT'){
                                    if(this.toggleElements.indexOf(mutation.target.children[i]) == -1){
                                        this.addToggleElement(mutation.target.children[i]);
                                    }
                                }else if(mutation.addedNodes[i].tagName === 'LANGUAGE-TOGGLE-ELEMENT'){
                                    if(this.toggleElements.indexOf(mutation.addedNodes[i].getToggleElement()) == -1){
                                        this.addToggleElement(mutation.addedNodes[i].getToggleElement());
                                    }
                                }
                            }
                        }
                    
                    }
                }
            });
        });
        observer.observe(this, { childList: true, subtree: true});
    }

    selectElement(element) {
        let isSelected = element.hasAttribute('toggled');
        if(this._selectedElement == element) {
            if(isSelected) {
                return true;
            }else{
                return false;
            }
        }else if(!this._selectedElement){
            if(isSelected){
                this._selectedElement = element;
                return true;
            }
            return false;
        }else{
            if(isSelected){
                this._selectedElement.removeAttribute('toggled');
                this._selectedElement = element;
                return true;
            }else{
                return true;
            }
        }
    }

    getValues() {
        let values = [];
        this.toggleElements.forEach((element) => {
            values[element.id||element.name] = element.hasAttribute('toggled');
        });
        return values;
    }

    getSelectedValue() {
        if(!this._selectedElement) return null;
        return this._selectedElement.id || this._selectedElement.getAttribute('name');
    }

    addToggleElement(toggle) {
        if(toggle.tagName == 'TOGGLE-ELEMENT') {
            this.toggleElements.push(toggle);
            toggle.setToggleGroup(this);
        }else{
            this.toggleElements.push(toggle.getToggleElement());
            toggle.getToggleElement().setToggleGroup(this);
        }
    }

    getSelectedElement() {
        return this._selectedElement;
    }
}

customElements.define('toggle-group-element', ToggleGroupElement);