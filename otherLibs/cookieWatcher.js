

function listenCookieChange(cookieKey, callback, interval = 100) {
    let lastCookies = getCookies();
    return setInterval(()=> {
        let currentCookies = getCookies();
        if(cookieKey == null || cookieKey == undefined){
            if(currentCookies.length == lastCookies.length){
                for(let key in currentCookies){
                    if(currentCookies[key] != lastCookies[key]){
                        callback(lastCookies[key], currentCookies[key], key);
                        lastCookies[key] = currentCookies[key];
                    }
                }
            }else if(currentCookies.length > lastCookies.length){
                for(let key in currentCookies){
                    if(lastCookies[key] === undefined){
                        callback(undefined, currentCookies[key], key);
                        lastCookies[key] = currentCookies[key];
                    }
                }
            }else if(currentCookies.length < lastCookies.length){
                for(let key in lastCookies){
                    if(currentCookies[key] === undefined){
                        callback(lastCookies[key], undefined, key);
                        delete lastCookies[key];
                    }
                }
            }
        }else{
            if(currentCookies[cookieKey] != lastCookies[cookieKey]){
                callback(lastCookies[cookieKey], currentCookies[cookieKey], cookieKey);
                lastCookies[cookieKey] = currentCookies[cookieKey];
            }
        }
    }, interval);
}

function getCookie(key){
    let cookies = getCookies();
    return cookies[key];
}

function setCookie(key, value, expires = 0, path = "/"){
    let cookie = `${key}=${value};path=${path}`;
    if(expires != 0){
        let date = new Date();
        date.setTime(date.getTime() + expires);
        cookie += `;expires=${date.toUTCString()}`;
    }
    document.cookie = cookie;
}

function getCookies(){
    let cookies = {};

    let match = document.cookie.match(/([^=;]+)=([^;]*)/g);
    if(match){
        for(let m of match){
            let [key, value] = m.split("=");
            cookies[key.trim()] = value.trim();
        }
    }
    return cookies;
}

let cookieWatcherId = null;

function initCookieWatcher(){
    if(cookieWatcherId != null)return;
    let id = listenCookieChange(null, (lastCookie, cookie, key)=>{
        document.dispatchEvent(new CustomEvent("cookieChange", {detail: {oldValue: lastCookie, newValue: cookie, key: key}}));
    });
}

function stopCookieWatcher(){
    clearInterval(cookieWatcherId);
    cookieWatcherId = null;
}