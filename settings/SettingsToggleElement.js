class SettingsToggleElement{

    constructor(data, elements){
        this.onchange = data.onchange || ((checked, func)=>{});
        this.onload = ()=>{
            if((this.data.disabled || false))return;
            (data.onload || ((checked)=>{}))(this.inputElement.checked, this.getOtherElement.bind(this));
        };

        this.data = data;

        this.element = document.createElement("div");
        this.element.className = "settings-element";

        this.title = document.createElement("h3");
        this.title.innerHTML = data.title;
        this.title.classList.add("settings-title");
        this.element.appendChild(this.title);

        if(data.label.startsWith("#")){
            this.title.innerHTML = lang.get(data.title.substring(1));
            lang.addUpdater(()=>{
                this.title.innerHTML = lang.get(data.title.substring(1))
            });
        }else{
            this.title.innerHTML = data.title || "TITLE";
        }

        this.label = document.createElement("label");
        this.label.innerHTML = data.label;
        this.label.classList.add("settings-label");
        this.element.appendChild(this.label);

        if(data.label.startsWith("#")){
            this.label.innerHTML = lang.get(data.label.substring(1));
            lang.addUpdater(()=>{
                this.label.innerHTML = lang.get(data.label.substring(1))
            });
        }else{
            this.label.innerHTML = data.label || "LABEL";
        }

        this.createToggleElement(data);
        this.input.classList.add("settings-input");

        this.description = document.createElement("span");
        this.description.innerHTML = data.description;
        this.description.classList.add("settings-description");
        this.element.appendChild(this.description);
        
        if(data.label.startsWith("#")){
            this.description.innerHTML = lang.get(data.description.substring(1));
            lang.addUpdater(()=>{
                this.description.innerHTML = lang.get(data.description.substring(1))
            });
        }else{
            this.description.innerHTML = data.description || "DESCRIPTION";
        }

        this.name = data.name || "";

        this.element.id = data.id || "";

        if(data.autosave || false){
            if(localStorage.getItem(this.name) == null){
                localStorage.setItem(this.name, this.inputElement.checked);
            }else{
                this.inputElement.checked = localStorage.getItem(this.name) === "true";
            }
        }

        this.elements = elements || [];
        this.setDisabled(data.disabled);
    }

    getElement(){
        return this.element;
    }

    setElement(element){
        this.element = element;
    }

    isChecked(){
        return this.inputElement.checked;
    }

    setChecked(checked){
        this.inputElement.checked = checked;
        this.saveState();
    }

    getName(){
        return this.name;
    }

    setName(name){
        this.name = name;
    }

    getOtherElement(name=""){
        return this.elements.find(e => e.getName() === name);
    }

    createToggleElement(data){

        this.input = document.createElement("div");

        this.inputLabel = document.createElement("label");
        this.inputLabel.classList.add("switch");

        this.inputElement = document.createElement("input");
        this.inputElement.type = "checkbox";
        this.inputElement.checked = data.checked || false;
        this.inputElement.onclick = this.onclick.bind(this);
        this.inputElement.classList.add("inputElement");

        this.inputLabel.appendChild(this.inputElement);

        let slider = document.createElement("div");
        slider.classList.add("slider");


        let circle = document.createElement("div");
        circle.classList.add("circle");

        circle.innerHTML = `
            <svg class="cross" xml:space="preserve" style="enable-background:new 0 0 512 512" viewBox="0 0 365.696 365.696" y="0" x="0" height="6" width="6" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <g>
                    <path data-original="#000000" fill="currentColor" d="M243.188 182.86 356.32 69.726c12.5-12.5 12.5-32.766 0-45.247L341.238 9.398c-12.504-12.503-32.77-12.503-45.25 0L182.86 122.528 69.727 9.374c-12.5-12.5-32.766-12.5-45.247 0L9.375 24.457c-12.5 12.504-12.5 32.77 0 45.25l113.152 113.152L9.398 295.99c-12.503 12.503-12.503 32.769 0 45.25L24.48 356.32c12.5 12.5 32.766 12.5 45.247 0l113.132-113.132L295.99 356.32c12.503 12.5 32.769 12.5 45.25 0l15.081-15.082c12.5-12.504 12.5-32.77 0-45.25zm0 0"></path>
                </g>
            </svg>
            <svg class="checkmark" xml:space="preserve" style="enable-background:new 0 0 512 512" viewBox="0 0 24 24" y="0" x="0" height="10" width="10" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <g>
                    <path class="" data-original="#000000" fill="currentColor" d="M9.707 19.121a.997.997 0 0 1-1.414 0l-5.646-5.647a1.5 1.5 0 0 1 0-2.121l.707-.707a1.5 1.5 0 0 1 2.121 0L9 14.171l9.525-9.525a1.5 1.5 0 0 1 2.121 0l.707.707a1.5 1.5 0 0 1 0 2.121z"></path>
                </g>
            </svg>
        `;

        slider.appendChild(circle);
        this.inputLabel.appendChild(slider);

        this.input.appendChild(this.inputLabel);

        this.element.appendChild(this.input);
    }

    saveState(){
        if((this.data.disabled || false))return;
        if(this.data.autosave || false){
            localStorage.setItem(this.name, this.inputElement.checked);
        }
    }

    setDisabled(disabled){
        this.inputElement.disabled = disabled;
        if(disabled)this.element.setAttribute("disabled", "");
        else this.element.removeAttribute("disabled");
    }

    isDisabled(){
        return this.data.disabled;
    }

    onclick(){
        if((this.data.disabled || false))return;
        if(this.data.autosave || false){
            localStorage.setItem(this.name, this.inputElement.checked);
        }
        this.onchange(this.inputElement.checked, this.getOtherElement.bind(this));
    }

}