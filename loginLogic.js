
async function deleteAllChats(){
    let deleteAll = confirm(lang.get("deleteAllChats.message"));
    if(deleteAll){
        await ChatStorage.INSTANCE.deleteAll();
        loadChats();
    }
}
var profileImageData = null;
let menu = null;
let sideMenu = null;
let promptBar = null;
let content = null;

document.addEventListener("documentLoaded", ()=>{
    menu = document.getElementById("menu");
    sideMenu = document.getElementById("sideMenu");
    promptBar = document.getElementById("promptBar");
    content = document.getElementById("content");
    menu.style.setProperty("--left", "260px");

    if($("#tmp").css("position") != "absolute"){
        menu.setAttribute("open", "");
        sideMenu.setAttribute("open", "");
        promptBar.setAttribute("open", "");
        content.setAttribute("open", "");
    }else{
        menu.removeAttribute("open");
        sideMenu.removeAttribute("open");
        promptBar.removeAttribute("open");
        content.removeAttribute("open");
    }

    menu.addEventListener("click", ()=>{
        if(menu.hasAttribute("open")){
            menu.removeAttribute("open");
            sideMenu.removeAttribute("open");
            promptBar.removeAttribute("open");
            content.removeAttribute("open");
        }else{
            menu.setAttribute("open", "");
            sideMenu.setAttribute("open", "");
            promptBar.setAttribute("open", "");
            content.setAttribute("open", "");
        }
    });
});

var clickCloseListener = (e)=>{
    if(isChildOf(document.getElementById('profileOptions'), e.target))return;
    if(isChildOf(document.getElementById('centerGooglelogin'), e.target))return;
    closeOptions();
};

document.addEventListener("click", clickCloseListener);

function closeOptions(){
    if(document.getElementById('profileOptions').hasAttribute('show')) toggleOptions();
}

function showOptions(){
    if(document.getElementById('profileOptions').hasAttribute('show')) return;
    toggleOptions();
}

function toggleOptions(){
    if(document.getElementById('profileOptions').hasAttribute('show')) document.getElementById('profileOptions').removeAttribute('show');
    else document.getElementById('profileOptions').setAttribute('show', '');

    if(document.getElementById('google').hasAttribute('show')) document.getElementById('google').removeAttribute('show');
    else document.getElementById('google').setAttribute('show', '');
}

async function init(){
    await downloadLangFile();
    initCookieWatcher();
    document.getElementById("profileOptions").style.setProperty("--bottom", $("#google").height() + "px");

    if(localStorage.getItem("name") != null)document.getElementById('name').innerText = localStorage.getItem("name");
    if(localStorage.getItem("email") != null)document.getElementById('email').innerText = localStorage.getItem("email");
    if(localStorage.getItem("imageData") != null)profileImageData = document.getElementById('profileImage').src = "data:image/png;base64," + localStorage.getItem("imageData");

    if(localStorage.getItem("googleLoggedIn") != "true"){
        google.accounts.id.disableAutoSelect();
    }

    let authKey = getCookie("authToken");

    if(isloggedIn()){
        OpenAI.INSTANCE.setAccessToken(authKey);
        document.getElementById("centerGooglelogin").removeAttribute("login");
        let intervalHideId = setInterval(()=>{
            if(document.getElementById("credential_picker_container")){
                if(authKey != null && authKey != undefined && authKey != "" && authKey != "null" && authKey != "undefined"){
                    document.getElementById("credential_picker_container").style.display = "none";
                    clearInterval(intervalHideId);
                }
            }
        });
        setTimeout(()=>clearInterval(intervalHideId), 1000*10);
        if(!modelsDownloaded)wait(lang.get("messages.wait.downloadingModels"), loadModelData);
    }else{
        document.getElementById("centerGooglelogin").setAttribute("login", "");
        if(document.getElementById("credential_picker_container"))document.getElementById("credential_picker_container").style.display = "block";
    }



}

async function downloadLangFile(){
    lang.setLanguage("en");
    await lang.download();
}

if ('serviceWorker' in navigator) {
    document.addEventListener("documentLoaded", ()=>{
        registerServiceWorker();
    });
}

async function registerServiceWorker(){
    // console.log(await navigator.serviceWorker.register('./offlineSw.js').catch(e=>console.error(e)));
}

async function handleCredentialResponse(credentials){
    if(credentials.clientId == undefined || credentials.clientId == null || credentials.clientId == "" || credentials.credential == undefined || credentials.credential == null || credentials.credential == ""){
        return;
    }
    let data = await OpenAI.INSTANCE.loginOrRegisterUser(credentials);

    if(data.ok === false){
        alert(lang.get(data.langPath), AlertType.ERROR, 3000);
        setTimeout(()=>{
            logoutOfApp(true);
        }, 3000);
        document.getElementById("centerGooglelogin").setAttribute("login", "");
        if(document.getElementById("credential_picker_container"))document.getElementById("credential_picker_container").style.display = "block";
    }else{
        if(data.registered){
            alert(lang.get("messages.success.register"), AlertType.SUCCESS, 3000);
        }else{
            alert(lang.get("messages.success.login"), AlertType.SUCCESS, 3000);
        }
        let name = data.name;
        let imageData = data.imageData;
        let email = data.email;

        localStorage.setItem("name", name);
        localStorage.setItem("email", email);
        localStorage.setItem("imageData", imageData);
        setCookie("authToken", credentials.credential, 1000*60*60);
        if(document.getElementById("credential_picker_container"))document.getElementById("credential_picker_container").style.display = "none";
        document.getElementById('name').innerText = name;
        document.getElementById('email').innerText = email;
        profileImageData = document.getElementById('profileImage').src = "data:image/png;base64," + imageData;
        document.getElementById("centerGooglelogin").removeAttribute("login");
        if(!modelsDownloaded)wait(lang.get("messages.wait.downloadingModels"), loadModelData);
        localStorage.setItem("googleLoggedIn", "true");
    }
}

function logoutOfApp(isSystem=false){
    closeOptions();

    document.getElementById("profileImage").src = "";
    document.getElementById("name").innerText = "";
    document.getElementById("email").innerText = "";

    localStorage.removeItem("name");
    localStorage.removeItem("email");
    localStorage.removeItem("imageData");
    localStorage.removeItem("")
    setCookie("authToken", "", -1);
    localStorage.setItem("googleLoggedIn", "false");

    let ds = $("dialog");
    for(let d of ds){
        d.close();
    }

    if(!isSystem)localStorage.setItem("showLogoutMessage", "true");

    location.reload();

}

document.addEventListener("documentLoaded", ()=>{
    lang.addUpdater(()=>{
        if(localStorage.getItem("showLogoutMessage")=="true"){
            alert(lang.get("messages.success.logout"), AlertType.SUCCESS, 2000);
            localStorage.removeItem("showLogoutMessage");
        }
    });
});

document.addEventListener("cookieChange", (e)=>{
    let oldValue = e.detail.oldValue;
    let newValue = e.detail.newValue;
    let key = e.detail.key;

    if(key == "g_state"){
        let parsedValue = JSON.parse(newValue);
        if(parsedValue.i_t != undefined || parsedValue.i_t != null){
            document.getElementById("email").innerText = "";
            document.getElementById("name").innerText = "";
            document.getElementById("profileImage").src = "";
            localStorage.removeItem("name");
            localStorage.removeItem("email");
            localStorage.removeItem("imageData");
            setCookie("authToken", "", -1);
            google.accounts.id.disableAutoSelect();
        }
    }
});