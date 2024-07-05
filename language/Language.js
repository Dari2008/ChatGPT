class Language{

    constructor(lang_code="en"){

        for(let lang of Object.keys(LanguageElementData.data)){
            if(LanguageElementData.data[lang].shortCode === lang_code){
                this.lang_code = lang;
                break;
            }
        }

        /*
        let result = "";
        Object.keys(LanguageElementData.data).forEach((key)=>{
        result += LanguageElementData.data[key].shortCode + ", "
        });

        console.log(result);

        de, es, fr, da, it, ja, ko, pt, ru, zh-CN, zh-TW

        */

        this.langs = [];

        for(let lang of Object.keys(LanguageElementData.data)){
            this.langs.push(lang.shortCode);
        }

        this.languageData = [];

        this.updaters = [];
    }

    get(path, langData=this.languageData, curs=0){
        if(curs > 1)return;
        try {
            let keys = path.split('.');
            let value = langData;
            for(let key of keys){
                value = value[key];
            }
            return value;
        } catch (error) {
            try{
                let keys = path.split('.');
                let value = Language.FALLBACK_DATA;
                for(let key of keys){
                    value = value[key];
                }
                return value;
            }catch(e){
                console.error("Language Error: " + path);
                return "";
            }
        }
    }

    setLanguage(lang_short_code){
        for(let lang of Object.keys(LanguageElementData.data)){
            if(lang == lang_short_code){
                this.lang_code = lang;
                break;
            }
            if(LanguageElementData.data[lang].shortCode === lang_short_code){
                this.lang_code = lang;
                break;
            }
        }
        if(document.body){
            document.body.setAttribute("lang", LanguageElementData.data[this.lang_code].shortCode);
            document.documentElement.setAttribute("lang", LanguageElementData.data[this.lang_code].shortCode);
        }else{
            document.addEventListener("documentLoaded", () => {
                document.body.setAttribute("lang", LanguageElementData.data[this.lang_code].shortCode);
                document.documentElement.setAttribute("lang", LanguageElementData.data[this.lang_code].shortCode);
            });
        }
    } 

    async loadLang(){
        if(LanguageElementData.data[this.lang_code].downloadUrl === undefined){
            this.languageData = Language.FALLBACK_DATA;
            return;
        }

        let response = await fetch(LanguageElementData.data[this.lang_code].downloadUrl);
        let data = await response.json();
        this.languageData = data;
    }

    async update(){
        if(document.wait){
            await document.wait("Downloading Language Data...", this.loadLang.bind(this));
        }else{
            await this.loadLang.bind(this)();
        }

        for(let updater of this.updaters){
            updater();
        }
    }

    async download(){
        if(document.wait){
            await document.wait("Downloading Language Data...", this.loadLang.bind(this));
        }else{
            await this.loadLang.bind(this)();
        }
    }

    addUpdater(updater){
        this.updaters.push(updater);
    }

    removeUpdater(updater){
        this.updaters = this.updaters.filter(u => u !== updater);
    }

}

Language.FALLBACK_DATA = {
    "cookieConsent": {
        "text": "This website uses cookies to ensure you get the best experience on our website.",
        "accept": "Accept",
        "refuse": "Refuse"
    },
    "messages": {
        "success": {
            "login": "Logged in Successfully!",
            "registered": "Registered Successfully!",
            "chatsNowOffline": "Chats are now offline available",
            "thePaymentWasSuccessfull": "The payment was completed successfully.<br>You have charged $%amount%."
        },
        "error": {
            "brushSizeMustBeBetween1and20": "Brush size must be between 1 and 20",
            "fileToBig4MB": "The image is too big! (Max 4MB)",
            "accessDenied": "Access Denied",
            "needToBeOnlineToUseThisFeature": "You need to be online to enable this feature",
            "error": "Error:\n",
            "thereWasAnErrorWithThePament": "There was an error during payment. Please try again.",
            "thePaymentWasCanceled": "The payment was canceled.",
            "couldNotLoadModels": "Could not load the models. Please try again later."
        },
        "wait": {
            "downloadingModels": "Downloading Models..."
        }
    },
    "confirm": {
        "doYouWantToDeleteImage": "Do you want to delete the image?"
    },
    "options": {
        "systemBehavior": "System Behavior",
        "rename": "Rename"
    },
    "imageEdit": {
        "title": "Select the affected area",
        "cancel": "Cancel",
        "ok": "Ok",
        "size": "Size",
        "invert": "Invert",
        "reset": "Reset"
    },
    "login": {
        "title": "Login",
        "orRegister": "or Register",
        "orLogin": "or Login",
        "login": "Login",
        "register": "Register"
    },
    "chats": {
        "newChat": "New Chat",
        "search": "Search",
        "searchPlaceholder": "Search...",
        "noChats": "No chats",
        "noChatsDesc": "Start a new chat or search for someone"
    },
    "chat": {
        "messagePlaceholders": {
            "gpt-4": "Chat with GPT-4...",
            "gpt-3": "Chat with GPT-3...",
            "gpt-2": "Chat with GPT-2...",
            "gpt-1": "Chat with GPT-1...",
            "dall-e-2": "Create Images with DALL-E 2...",
            "dall-e-3": "Create Images with DALL-E 3..."
        }
    },
    "settingsOptions": {
        "payIn": "Pay in",
        "usage": "Usage",
        "deleteAllChats": "Delete all chats",
        "settings": "Settings",
        "logout": "Logout",
        "termsOfUse": "Terms of use",
        "privacyPolicy": "Privacy Policy"
    },
    "payIn": {
        "scene1": {
            "title": "Choose Amount"
        },
        "scene2": {
            "title": "Overview",
            "amount": "Amount",
            "fee": "Fee",
            "total": "Total"
        },
        "scene3": {
            "title": "Payment"
        },
        "next": "Next",
        "back": "Back",
        "close": "Close",
        "finish": "Finish",
        "waiting": "Waiting..."
    },
    "usage": {
        "title": "Usage",
        "available": "Available",
        "activity": "Activity",
        "chatAi": "Chat AI",
        "imageAi": "Image AI",
        "downloadAsPDF": "Download as PDF"
    },
    "deleteAllChats": {
        "message": "Are you sure you want to delete all chats?"
    },
    "settings": {
        "titles": {
            "network": "Network",
            "performance": "Performance",
            "offline": "Offline",
            "language": "Language",
            "trackings": "Trackings"
        },
        "network": {
            "title": "Network",
            "content": {
                "stream": {
                    "title": "Stream",
                    "label": "Get the data in small chunks and display them immediately",
                    "desc": "Stream the data from the server to the client<ul style='list-style-type: disc; padding-left: 20px;'><li style='color:lightgreen;'>Result is faster readable</li><li style='color:rgb(255, 159, 0);'>May consume more memory</li></ul>"
                },
                "oneChunk": {
                    "title": "In One Chunk",
                    "label": "Get all data at once",
                    "desc": "Get all the data in one chunk<ul style='list-style-type: disc; padding-left: 20px;'><li style='color:lightgreen;'>Consumes less memory</li><li style='color:rgb(255, 159, 0);'>Result is slower readable</li></ul>"
                }
            }
        },
        "performance": {
            "title": "Chat Performance",
            "content": {
                "animateTyping": {
                    "title": "Typing Animation",
                    "label": "Animate the AI typing",
                    "desc": "Show the typing animation<ul style='list-style-type: disc; padding-left: 20px;'><li style='color:lightgreen;'>Looks better</li><li style='color:rgb(255, 159, 0);'>May lag more</li><li style='color:rgb(255, 55, 55);'>Is not compatible with <a class='link' target='_blank' href='https://openai.com/dall-e-2'>dall⋅e 2</a>, <a class='link' target='_blank' href='https://openai.com/dall-e-3'>dall⋅e 3</a> and <a class='link' onclick='switchToSettingsTab('network');'>Streaming</a></li></ul>"
                },
                "maxMessageChatCount": {
                    "title": "Max Message Chat Count",
                    "label": "Maximum Messages stored in Chat History",
                    "desc": "The maximum amount of messages that are loaded at once<ul style='list-style-type: disc; padding-left: 20px;'><li style='color:lightgreen;'>Less memory consumption</li><li style='color:rgb(255, 159, 0);'>Less cost</li></ul>"
                }
            },
            "title2": "Message Performance",
            "content2": {
                "maxMessageLoadCount": {
                    "title": "Max Message Load Count",
                    "label": "Maximum Messages loaded from Server/Storage at once",
                    "desc": "The maximum amount of messages that are loaded at once<ul style='list-style-type: disc; padding-left: 20px;'><li style='color:lightgreen;'>Less memory consumption</li><li style='color:rgb(255, 159, 0);'>More requests</li></ul>"
                },
                "maxMessageSendCount": {
                    "title": "Max Message Send Count",
                    "label": "Maximum Messages send to Server in one Request",
                    "desc": "The maximum amount of messages that are send as chat history for the AI to remember things<ul style='list-style-type: disc; padding-left: 20px;'><li style='color:lightgreen;'>Less memory consumption</li><li style='color:lightgreen;'>May lag less</li><li style='color:lightgreen;'>Less Mobile Data consumption</li><li style='color:rgb(255, 159, 0);'>Less cost</li><li style='color:rgb(255, 159, 0);'>AI remembers less</li></ul>"
                },
                "showProfileImage": {
                    "title": "Show Profile Image",
                    "label": "Show the Profile Image of the User and the AI",
                    "desc": "Show the profile image of the user and the AI<ul style='list-style-type: disc; padding-left: 20px;'><li style='color:lightgreen;'>Looks better</li><li style='color:rgb(255, 159, 0);'>May lag more</li></ul>"
                }
            }
        },
        "offline": {
            "title": "Offline",
            "content": {
                "offlineToggle": {
                    "title": "Chats without internet connection",
                    "label": "View the Chats without an internet connection",
                    "desc": "View the Chats without an internet connection<ul style='list-style-type: disc; padding-left: 20px;'><li style='color:lightgreen;'>No internet connection needed</li><li style='color:orange;'>consumes mor disc space</li><li style='color:rgb(255, 55, 55);'>Not working when Chats are stored on the Server</li></ul>"
                }
            }
        },
        "language": {
            "title": "Language"
        },
        "trackings": {
            "title": "Tracking",
            "googleAnalytics": {
                "title": "Google Analytics",
                "label": "Allow Google Analytics",
                "desc": "Allow Google Analytics to track your usage<ul style='list-style-type: disc; padding-left: 20px;'><li style='color:lightgreen;'>Helps to improve the service</li></ul><br>Following Data is collected:<ul style='list-style-type: disc; padding-left: 20px;'><li style='color:rgb(255, 159, 0);'>Model usage</li></ul>"
            }
        }
    },
    "languageNames":{
        "names":{
            "de":"German",
            "en":"English",
            "es":"Spanish",
            "fr":"French",
            "it":"Italian",
            "ja":"Japanese",
            "ko":"Korean",
            "pt":"Portuguese",
            "ru":"Russian",
            "zh-CN":"Chinese (Simplified)",
            "zh-TW":"Chinese (Traditional)",
            "da":"Danish"
        }
    }
};