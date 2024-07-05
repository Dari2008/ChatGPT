var isDataLoaded = false;

document.addEventListener('documentLoaded', function() {
  
    let settingOptions = [
        {
            name: "network",
            id: "network",
            label: "#settings.titles.network",
            selected: false,
            options:[
                {
                    title: "#settings.titles.network",
                    hnumber: 2,
                    content:[
                        {
                            name: "stream",
                            title: "#settings.network.content.stream.title",
                            label: "#settings.network.content.stream.label",
                            type: "toggle",
                            description: "#settings.network.content.stream.desc",
                            autosave: true,
                            checked: true,
                            onchange: (value, getOtherElement)=>{
                                if(getOtherElement("inOneChunk").isChecked() && value){
                                    OpenAI.INSTANCE.setStream(value);
                                    getOtherElement("inOneChunk").setChecked(false);
                                }else{
                                    OpenAI.INSTANCE.setStream(value);
                                    getOtherElement("inOneChunk").setChecked(true);
                                }
                                getOtherElement("typeAnimation").setDisabled(value);
                            },
                            onload:(value, getOtherElement)=>{
                                OpenAI.INSTANCE.setStream(value);
                                getOtherElement("typeAnimation").setDisabled(value);
                            }
                        },
                        {
                            name: "inOneChunk",
                            title: "#settings.network.content.oneChunk.title",
                            label: "#settings.network.content.oneChunk.label",
                            type: "toggle",
                            description: "#settings.network.content.oneChunk.desc",
                            autosave: true,
                            checked: false,
                            onchange: (value, getOtherElement)=>{
                                if(getOtherElement("stream").isChecked() && value){
                                    OpenAI.INSTANCE.setStream(value);
                                    getOtherElement("stream").setChecked(false);
                                }else{
                                    OpenAI.INSTANCE.setStream(value);
                                    getOtherElement("stream").setChecked(true);
                                }
                                getOtherElement("typeAnimation").setDisabled(!value);
                            },
                            onload:(value, getOtherElement)=>{
                                OpenAI.INSTANCE.setStream(!value);
                                getOtherElement("typeAnimation").setDisabled(!value);
                            }
                        }
                    ]
                }
            ]
        },
        {
            name: "Performance",
            id: "performance",
            label: "#settings.titles.performance",
            selected: false,
            options:[
                {
                    title: "#settings.performance.title",
                    hnumber: 2,
                    content:[
                        {
                            name: "typeAnimation",
                            title: "#settings.performance.content.animateTyping.title",
                            label: "#settings.performance.content.animateTyping.label",
                            type: "toggle",
                            description: "#settings.performance.content.animateTyping.desc",
                            autosave: true,
                            checked: true,
                            onchange: (value, getOtherElement)=>{
                                OpenAI.INSTANCE.setNatrualTyping(value);
                            },
                            onload:(value, getOtherElement)=>{
                                OpenAI.INSTANCE.setNatrualTyping(value);
                            }
                        },
                        {
                            name: "maxMessageChatCount",
                            title: "#settings.performance.content.maxMessageChatCount.title",
                            label: "#settings.performance.content.maxMessageChatCount.label",
                            description: "#settings.performance.content.maxMessageChatCount.desc",
                            type: "number",
                            infoImage: SVGData.MESSAGE_DATA,
                            info: "#settings.performance.content.maxMessageChatCount.info",
                            autosave: true,
                            value: "auto",
                            onchange: (value, getOtherElement)=>{
                                OpenAI.INSTANCE.setMaxMessageChatCount(value);
                            },
                            validateInput: (value)=>{
                                if(value == "")return "";
                                if(value == "a")return "auto";
                                if(value == "au")return "auto";
                                if(value == "aut")return "auto";
                                if(value == "auto")return "auto";
                                value = parseInt(value) || 2;
                                if(value < 1)return "auto";
                                return Math.round(value/2)*2;
                            },
                            onincrease: (value, getOtherElement)=>{
                                if(value == "auto")return 1;
                                value = parseInt(value) || 1;
                                return value + 2;
                            },
                            ondecrease: (value, getOtherElement)=>{
                                if(value == "auto")return "auto";
                                value = parseInt(value) || 1;
                                return ((value - 2) < 1) ? "auto" : (value - 2);
                            },
                            onload: (value, getOtherElement)=>{
                                OpenAI.INSTANCE.setMaxMessageChatCount(value);
                            }
                        },
                    ]
                },
                {
                    title: "#settings.performance.title2",
                    hnumber: 2,
                    content:[
                        {
                            name: "maxMessageLoadCount",
                            title: "#settings.performance.content2.maxMessageLoadCount.title",
                            label: "#settings.performance.content2.maxMessageLoadCount.label",
                            description: "#settings.performance.content2.maxMessageLoadCount.desc",
                            type: "number",
                            infoImage: SVGData.MESSAGE_DATA,
                            info: "#settings.performance.content2.maxMessageLoadCount.info",
                            autosave: true,
                            value: "auto",
                            onchange: (value, getOtherElement)=>{
                                OpenAI.INSTANCE.setMaxMessageLoadCount(value);
                            },
                            validateInput: (value)=>{
                                if(value == "")return "";
                                if(value == "a")return "auto";
                                if(value == "au")return "auto";
                                if(value == "aut")return "auto";
                                if(value == "auto")return "auto";
                                value = parseInt(value) || 2;
                                if(value < 1)return "auto";
                                return Math.round(value/2)*2;
                            },
                            onincrease: (value, getOtherElement)=>{
                                if(value == "auto")return 1;
                                value = parseInt(value) || 1;
                                return value + 2;
                            },
                            ondecrease: (value, getOtherElement)=>{
                                if(value == "auto")return "auto";
                                value = parseInt(value) || 1;
                                return ((value - 2) < 1) ? "auto" : (value - 2);
                            },
                            onload: (value, getOtherElement)=>{
                                OpenAI.INSTANCE.setMaxMessageLoadCount(value);
                            }
                        },
                        {
                            name: "maxMessageSendCount",
                            title: "#settings.performance.content2.maxMessageSendCount.title",
                            label: "#settings.performance.content2.maxMessageSendCount.label",
                            description: "#settings.performance.content2.maxMessageSendCount.desc",
                            type: "number",
                            infoImage: SVGData.MESSAGE_DATA,
                            info: "#settings.performance.content2.maxMessageSendCount.info",
                            autosave: true,
                            value: "auto",
                            onchange: (value, getOtherElement)=>{
                                OpenAI.INSTANCE.setMaxMessageSendCount(value);
                            },
                            validateInput: (value)=>{
                                if(value == "")return "";
                                if(value == "a")return "auto";
                                if(value == "au")return "auto";
                                if(value == "aut")return "auto";
                                if(value == "auto")return "auto";
                                value = parseInt(value) || 2;
                                if(value < 1)return "auto";
                                return Math.round(value/2)*2;
                            },
                            onincrease: (value, getOtherElement)=>{
                                if(value == "auto")return 1;
                                value = parseInt(value) || 1;
                                return value + 2;
                            },
                            ondecrease: (value, getOtherElement)=>{
                                if(value == "auto")return "auto";
                                value = parseInt(value) || 1;
                                return ((value - 2) < 1) ? "auto" : (value - 2);
                            },
                            onload: (value, getOtherElement)=>{
                                OpenAI.INSTANCE.setMaxMessageSendCount(value);
                            }
                        },
                        {
                            name: "showProfileImage",
                            title: "#settings.performance.content2.showProfileImage.title",
                            label: "#settings.performance.content2.showProfileImage.label",
                            description: "#settings.performance.content2.showProfileImage.desc",
                            type: "toggle",
                            autosave: true,
                            checked: true,
                            onchange: (value, getOtherElement)=>{
                                OpenAI.INSTANCE.setShowProfileImage(value);
                            },
                            onload:(value, getOtherElement)=>{
                                OpenAI.INSTANCE.setShowProfileImage(value);
                            }
                        }
                    ]
                }
            ]
        },
        {
            name: "Offline",
            id: "Offline",
            label: "#settings.titles.offline",
            selected: false,
            options:[
                {
                    title: "#settings.offline.title",
                    hnumber: 2,
                    content:[
                        {
                            name: "offlineToggle",
                            title: "#settings.offline.content.offlineToggle.title",
                            label: "#settings.offline.content.offlineToggle.label",
                            description: "#settings.offline.content.offlineToggle.desc",
                            type: "toggle",
                            autosave: true,
                            checked: false,
                            disabled: !('serviceWorker' in navigator),
                            onchange: (value, getOtherElement)=>{
                                if(!value){
                                    return;
                                }
                                gapi.auth2.getAuthInstance().currentUser.get().grantOfflineAccess({
                                    prompt: "consent",
                                    scope: "profile email",

                                }).then((res)=>{
                                    alert(lang.get("messages.success.chatsNowOffline"), AlertType.SUCCESS, 5000);
                                }).catch((err)=>{
                                    if(err.error == "popup_closed_by_user"){
                                        alert(lang.get("messages.error.accessDenied"), AlertType.ERROR, 5000);
                                        getOtherElement("offline").setChecked(false);
                                    }else{
                                        alert(lang.get("messages.error.needToBeOnlineToUseThisFeature"), AlertType.ERROR, 5000);
                                    }
                                });
                            },
                        }
                    ]
                }
            ]
        },
        {
            name: "Language",
            id: "Language",
            label: "#settings.titles.language",
            selected: false,
            options:[
                {
                    title: "#settings.language.title",
                    hnumber: 2,
                    content:[
                        {
                            name: "language",
                            type: SettingsLanguageMenu,
                            languages: LanguageElementData.languages(),
                            autosave: true,
                            onload: async (value, getOtherElement)=>{
                                lang.setLanguage(value);
                                await lang.update();
                            },
                            onchange: async (value, getOtherElement)=>{
                                lang.setLanguage(value);
                                await lang.update();
                            }
                        }
                    ]
                }
            ]
        },
        {
            title: "#settings.titles.trackings",
            id: "trackings",
            label: "#settings.titles.trackings",
            selected: false,
            options:[
                {
                    title: "#settings.trackings.title",
                    hnumber: 2,
                    content:[
                        {
                            name: "googleAnalytics",
                            title: "#settings.trackings.googleAnalytics.title",
                            label: "#settings.trackings.googleAnalytics.label",
                            description: "#settings.trackings.googleAnalytics.desc",
                            type: "toggle",
                            autosave: true,
                            checked: true,
                            onchange: (value, getOtherElement)=>{
                                if(value){
                                    gtag('config', 'G-19PQ84947V', {
                                        'send_page_view': true
                                    });
                                }else{
                                    gtag('config', 'G-19PQ84947V', {
                                        'send_page_view': false
                                    });
                                }
                            },
                            onload:(value, getOtherElement)=>{
                                if(value){
                                    gtag('config', 'G-19PQ84947V', {
                                        'send_page_view': true
                                    });
                                }else{
                                    gtag('config', 'G-19PQ84947V', {
                                        'send_page_view': false
                                    });
                                }
                            }
                        }
                    ]
                }
            ]
        },
        {
            name: "Appearance",
            id: "Appearance",
            label: "#settings.titles.appearance",
            selected: false,
            options:[
                {
                    title: "#settings.appearance.title",
                    hnumber: 2,
                    content: [
                        {
                            name: "lightDarkMode",
                            title: "#settings.appearance.content.lightDarkMode.title",
                            label: "#settings.appearance.content.lightDarkMode.label",
                            description: "#settings.appearance.content.lightDarkMode.desc",
                            type: "toggle",
                            autosave: true,
                            checked: isDarkMode,
                            onchange: (value, getOtherElement)=>{
                                document.documentElement.classList.remove(value?"light":"dark");
                                document.documentElement.classList.add(value?"dark":"light");
                            },
                            onload: (value, getOtherElement)=>{
                                document.documentElement.classList.remove(value?"light":"dark");
                                document.documentElement.classList.add(value?"dark":"light");
                            }
                        }
                    ]
                }
            ]
        }
    ];

    let settingsList = document.getElementById("settingsList");
    let contents = document.getElementById("contents");

    let wasSelected = false;

    let elements = [];

    for(let setting of settingOptions){
        let settingElement = document.createElement("button");
        let borderRemover = document.createElement("div");
        borderRemover.classList.add("borderRemover");
        if(setting.label.startsWith("#")){
            settingElement.innerText = lang.get(setting.label.substring(1));
            settingElement.appendChild(borderRemover);
            lang.addUpdater(()=>{
                settingElement.innerText = lang.get(setting.label.substring(1))
                settingElement.appendChild(borderRemover);
            });
        }else{
            settingElement.innerText = setting.label || "";
            settingElement.appendChild(borderRemover);
        }

        settingElement.id = setting.id;
        settingsList.appendChild(settingElement);
        settingElement.onclick = ()=>{

            $("#settingsList button").removeAttr("selected");

            settingElement.setAttribute("selected", "");

            contents.innerHTML = "";

            for(let e of setting.elements){
                contents.appendChild(e.getElement());
            }

        };

        setting.elements = [];
        for(let e of setting.options){
            let titleElement = new SettingsTitleElement(e, elements);
            setting.elements.push(titleElement);
            elements.push(titleElement);
        }

        if(!wasSelected && setting.selected){
            wasSelected = true;
            settingElement.setAttribute("selected", "");
            settingElement.click();
        }

    }

    for(let e of elements){
        if(e.load)e.load();
    }

    document.addEventListener("keyup", (e)=>{
        if(document.getElementById("settingsDialog").hasAttribute("show")){
            if(e.key == "Escape"){
                e.preventDefault();
                toggleSettings();
            }
        }
    });
});

function switchToSettingsTab(id){
    $("#settingsList #" + id).click();
}