class SettingsNumberSelectorElelement{

    constructor(data, elements){

        this.data = data;

        this.validateInput = function(input){
            if(this.data.validateInput){
                return this.data.validateInput(input);
            }else{
                return input;
            }
        }.bind(this);

        this.element = document.createElement("div");
        this.element.className = "settings-element";

        this.title = document.createElement("h3");
        this.title.classList.add("settings-title");
        this.element.appendChild(this.title);
        
        if(data.title.startsWith("#")){
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

        this.createNumberSelectorElement(data);
        this.inputFieldForSpinner.oninput = function(){
            if((this.data.disabled || false))return;
            this.onchange.bind(this)();
        }.bind(this);
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
                localStorage.setItem(this.name, this.validateInput(this.inputFieldForSpinner.value));
            }else{
                this.inputFieldForSpinner.value = this.validateInput(localStorage.getItem(this.name));
            }
        }

        this.elements = elements || [];
        this.onload = ()=>{
            if((this.data.disabled || false))return;
            (data.onload || ((checked)=>{}))(this.validateInput(localStorage.getItem(this.name)), this.getOtherElement.bind(this));
        };

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

    setValue(value){
        this.inputFieldForSpinner.value = this.validateInput(value);
        this.saveState();
    }

    getValue(){
        return this.validateInput(this.inputFieldForSpinner.value);
    }

    createNumberSelectorElement(data){

        this.input = document.createElement("div");

        this.spinnerInput = document.createElement("div");
        this.spinnerInput.classList.add("spinnerInput");

        this.decrease = document.createElement("button");
        this.decrease.classList.add("decrease");

        this.decreaseIcon = document.createElement("div");
        this.decrease.appendChild(this.decreaseIcon);

        this.inputFieldForSpinner = document.createElement("input");
        this.inputFieldForSpinner.classList.add("inputFieldForSpinner");
        this.inputFieldForSpinner.type = data.inputType || "text";
        this.inputFieldForSpinner.min = data.min || 1;
        this.inputFieldForSpinner.max = data.max || "auto";
        this.inputFieldForSpinner.increment = data.increment || data.step || 1;
        this.inputFieldForSpinner.placeholder = data.placeholder || "";
        this.inputFieldForSpinner.value = data.value || "1";

        this.inputFielInfo = document.createElement("div");
        this.inputFielInfo.classList.add("inputFielInfo");

        this.inputFielInfo.innerHTML = data.infoImage || "";

        this.inputFielInfoSpan = document.createElement("span");

        if(data.label.startsWith("#")){
            this.inputFielInfoSpan.innerHTML = lang.get(data.info.substring(1));
            lang.addUpdater(()=>{
                this.inputFielInfoSpan.innerHTML = lang.get(data.info.substring(1))
            });
        }else{
            this.inputFielInfoSpan.innerHTML = data.info || "info";
        }
        this.inputFielInfo.appendChild(this.inputFielInfoSpan);

        this.increase = document.createElement("button");
        this.increase.classList.add("increase");

        this.increaseIcon = document.createElement("div");
        this.increase.appendChild(this.increaseIcon);

        this.spinnerInput.appendChild(this.decrease);
        this.spinnerInput.appendChild(this.inputFieldForSpinner);
        this.spinnerInput.appendChild(this.inputFielInfo);
        this.spinnerInput.appendChild(this.increase);

        this.input.appendChild(this.spinnerInput);

        this.element.appendChild(this.input);

        this.increase.onclick = function(){
            if((this.data.disabled || false))return;
            this.inputFieldForSpinner.value = this.validateInput((this.data.onincrease || ((value, getOtherElement)=>{}))(this.validateInput(this.inputFieldForSpinner.value), this.getOtherElement.bind(this)));
            this.saveState();
            this.onchange();
        }.bind(this);
        

        this.decrease.onclick = function(){
            if((this.data.disabled || false))return;
            this.inputFieldForSpinner.value = this.validateInput((this.data.ondecrease || ((value, getOtherElement)=>{}))(this.validateInput(this.inputFieldForSpinner.value), this.getOtherElement.bind(this)));
            this.saveState();
            this.onchange();
        }.bind(this);

    }

    saveState(){
        if((this.data.disabled || false))return;
        if(this.data.autosave || false){
            localStorage.setItem(this.name, this.validateInput(this.inputFieldForSpinner.value));
        }
    }

    onchange(){
        if((this.data.disabled || false))return;
        let newValue = this.validateInput(this.inputFieldForSpinner.value);
        if(this.data.autosave || false){
            localStorage.setItem(this.name, newValue);
        }
        this.inputFieldForSpinner.value = newValue;
        this.data.onchange(newValue, this.getOtherElement.bind(this));
    }

    setDisabled(disabled){
        this.data.disabled = disabled;
        this.inputFieldForSpinner.disabled = disabled;

        if(disabled)this.element.setAttribute("disabled", "");
        else this.element.removeAttribute("disabled");
    }

    isDisabled(){
        return this.data.disabled;
    }

}