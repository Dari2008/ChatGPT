class SettingsLanguageMenu{
    constructor(data, elements){
        this.elements = elements;
        this.name = data.name || "";

        this.toggleElements = [];

        this.onchange = (langCode) => {
            if(data.autosave || false){
                localStorage.setItem(this.name, langCode);
            }
            if(data.onchange){
                data.onchange(langCode, this.getOtherElement.bind(this));
            }
        };


        let wasLoaded = false;

        this.onload = () => {
            if(!wasLoaded){
                wasLoaded = true;
                if(data.onload){
                    data.onload(data.currentLang, this.getOtherElement.bind(this));
                }
            }
        };

        this.mainElement = document.createElement("div");
        this.mainElement.classList.add("settings-language-menu");

        if(data.autosave || false){
            if(localStorage.getItem(this.name) == null){
                localStorage.setItem(this.name, LanguageElementData.defaultLanguage);
            }
            data.currentLang = localStorage.getItem(this.name);
        }else{
            data.currentLang = LanguageElementData.defaultLanguage;
        }

        if(!data.currentLang)data.currentLang = LanguageElementData.defaultLanguage;

        for(let langCodes of data.languages){
            let langElement = document.createElement("language-toggle-element");
            langElement.setAttribute("langCode", langCodes);
            langElement.setAttribute("currentLangCode", data.currentLang);

            if(langCodes == data.currentLang){
                langElement.toggle();
            }

            langElement.addEventListener("toggle", (e) => {
                data.currentLang = e.detail.lang;
                for(let to of this.toggleElements){
                    if(to.getAttribute("landCode") != e.detail.lang){
                        to.removeAttribute("toggled");
                    }
                }
                this.onchange(e.detail.lang);
            });
            this.mainElement.appendChild(langElement);
            this.toggleElements.push(langElement);
        }

        this.onload();

    }

    getOtherElement(name=""){
        return this.elements.find(e => e.getName() === name);
    }

    getElement(){
        return this.mainElement;
    }

}