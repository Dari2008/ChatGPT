class SettingsTitleElement{
    constructor(data, elements){
        this.elements = elements;
        this.mainElement = document.createElement("div");
        this.element = document.createElement("h" + (data.hnumber || 3));
        this.element.classList.add("settings-title-element");
        this.element.id = data.id || "";

        if(data.title.startsWith("#")){
            this.element.innerHTML = lang.get(data.title.substring(1));
            lang.addUpdater(()=>{
                this.element.innerHTML = lang.get(data.title.substring(1));
            });
        }else{
            this.element.innerHTML = data.title || "TITLE";
        }


        this.data = data;
        this.content = data.content || "";

        this.contentElement = document.createElement("div");
        this.contentElement.classList.add("settings-title-element-content");
        this.parseData();

        this.mainElement.appendChild(this.element);
        this.mainElement.appendChild(this.contentElement);
    }

    parseData(){
        for(let element of this.content){
            if(element.type === "title"){
                let classElement = new SettingsTitleElement(element, this.elements);
                this.contentElement.appendChild(classElement.getElement());
                this.elements.push(classElement);
            }else if(element.type === "toggle"){
                let classElement = new SettingsToggleElement(element, this.elements);
                this.contentElement.appendChild(classElement.getElement());
                this.elements.push(classElement);
            }else if(element.type === "number"){
                let classElement = new SettingsNumberSelectorElelement(element, this.elements);
                this.contentElement.appendChild(classElement.getElement());
                this.elements.push(classElement);
            }else if(typeof element.type == "function"){
                let classElement = new element.type(element, this.elements);
                this.contentElement.appendChild(classElement.getElement());
                this.elements.push(classElement);

            }
        }
    }

    getElement(){
        return this.mainElement;
    }

    setElement(element){
        this.mainElement = element;
    }

    setTitle(title){
        this.element.innerHTML = title;
    }

    getTitle(){
        return this.element.innerHTML;
    }

    getName(){
        return this.data.name || "";
    }

    setName(name){
        this.data.name = name;
    }

    setDisabled(disabled){
        this.element.disabled = disabled;
        this.element.disabled = disabled;
    }

    isDisabled(){
        return this.element.disabled;
    }

    load(){
        for(let element of this.elements){
            if(!element.onload)continue;
            element.onload();
        }
    }

}