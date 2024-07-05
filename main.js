
var currentChat = null;
var codeSign = "```";

document.addEventListener('documentLoaded', function(){
    document.getElementById("promptArea").onkeydown = function(e){
        if(e.key == "Enter" && !e.shiftKey){
            e.preventDefault();
            sendMessage();
        }
    };

    document.getElementById("newChat").onclick = function(){
        let chat = new Chat();
        ChatStorage.INSTANCE.save(chat);
        loadChat(chat);
        loadChats(chat);
    };
});

async function sendMessage(){
    document.getElementById("promptArea").blur();
    if(document.getElementById("promptArea").value.length > 0){

        if(!isloggedIn()){
            alert(lang.get("messages.error.notLoggedIn"), AlertType.ERROR, 5000);
            return;
        }

        if(currentChat == null){
            let chat = new Chat();
            chat.setModel(getCurrentModel());
            ChatStorage.INSTANCE.save(chat);
            loadChat(chat);
            addChatToSideMenu(chat, true);
        }

        let message = new Message("user", document.getElementById("promptArea").value);
        message.setModel(currentChat.getModel());

        document.getElementById("promptArea").value = "";

        let model = currentChat.getModel();
        currentChat.getHistory().addMessage(message);
        let wasMessageRemoved = false;

        switch(model){
            case "dall-e-2":
                if(currentImageEditing != null && maskImage != null){
                    message.changeToUserImageMessage(createIdForImage(currentImageEditing), createIdForImage(maskImage));
                    clearCurrentImage();
                    createMessageWithAttachment(message, true);
                    let result = await sendLoadingMessage(currentChat.promptImageWithImage(message));
                    if(result.ok){
                        let uid = ImageStorage.INSTANCE.addImage("data:image/png;base64," + result.data);
                        sendResultImage("data:image/png;base64," + result.data, message.getShortName());
                        let msg = new Message("assistant", uid, true);
                        msg.setModel(currentChat.getModel());
                        wasMessageRemoved = currentChat.getHistory().addMessage(msg);
                        ChatStorage.INSTANCE.save(currentChat);
                        updateUsage();
                    }
                    break;
                }
            case "gpt-4-vision-preview":
                if(currentImageEditing != null && model == "gpt-4-vision-preview"){
                    message.changeToUserImageMessage(createIdForImage(currentImageEditing), null);
                    clearCurrentImage();
                    createMessageWithAttachment(message, true);
                    let msg = new Message("assistant", "");
                    msg.setModel(currentChat.getModel());
                    let result = await sendLoadingMessage(new Promise(async (res, rej)=>{
                        let id = null;
                        let data = await currentChat.promptWithImage(message, (data, isFinished)=>{
                            if(data.message == undefined || data.message == null){
                                res({stream:true, ok:false});
                                return;
                            }
                            const win = ()=>{
                                msg = new Message("assistant", contentData[id]["content"]);
                                msg.setModel(currentChat.getModel());
                                wasMessageRemoved = currentChat.getHistory().addMessage(msg);
                                res({stream:true, ok:true});
                                sendResultStreamMessage("", id, true);
                                ChatStorage.INSTANCE.save(currentChat);
                                updateUsage();
                                return;
                            };
                            try{
                                if(isFinished){
                                    win();
                                    return;
                                }
                                if(id == null){
                                    id = sendResultStreamMessage(data.message, undefined, msg.getShortName());
                                }else{
                                    sendResultStreamMessage(data.message, id);
                                }
                            }catch(e){
                                // win();
                                console.log(e);
                                return;
                            }
                        });

                        if(!OpenAI.INSTANCE.isStream()){
                            res(data);
                        }

                    }));
                    if(result instanceof Message){
                        sendResultMessage(result, message.getShortName());
                        result.setModel(currentChat.getModel());
                        wasMessageRemoved = currentChat.getHistory().addMessage(result);
                        ChatStorage.INSTANCE.save(currentChat);
                        updateUsage();
                    }
                    break;
                }

            default:
                if(isImageAi(model)){
                    addMessageToContent(message, true);
                    let result = await sendLoadingMessage(currentChat.promptImage(message));
                    if(result.ok){
                        let uid = ImageStorage.INSTANCE.addImage("data:image/png;base64," + result.data);
                        sendResultImage("data:image/png;base64," + result.data, message.getShortName());
                        let msg = new Message("assistant", uid, true);
                        msg.setModel(currentChat.getModel());
                        wasMessageRemoved = currentChat.getHistory().addMessage(msg);
                        ChatStorage.INSTANCE.save(currentChat);
                        updateUsage();
                    }
                }else{
                    addMessageToContent(message, true);
                    let id = null;
                    let msg = new Message("assistant", "");
                    msg.setModel(currentChat.getModel());
                    let result = await sendLoadingMessage(new Promise(async (res, rej)=>{
                        let id = null;
                        let data = await currentChat.prompt(message, (data, isFinished)=>{
                            if(data.message == undefined || data.message == null){
                                res({stream:true, ok:false});
                                return;
                            }

                            const win = ()=>{
                                msg = new Message("assistant", contentData[id]["content"]);
                                msg.setModel(currentChat.getModel());
                                wasMessageRemoved = currentChat.getHistory().addMessage(msg);
                                res({stream:true, ok:true});
                                sendResultStreamMessage("", id, true);
                                ChatStorage.INSTANCE.save(currentChat);
                                updateUsage();
                                return;
                            };

                            try{
                                if(isFinished){
                                    win();
                                    return;
                                }
                                if(id == null){
                                    id = sendResultStreamMessage(data.message, undefined, msg.getShortName());
                                }else{
                                    sendResultStreamMessage(data.message, id);
                                }
                            }catch(e){
                                // win();
                                console.log(e);
                                return;
                            }
                        });

                        if(!OpenAI.INSTANCE.isStream()){
                            res(data);
                        }
                    }));
                    if(result instanceof Message){
                        sendResultMessage(result, message.getShortName());
                        result.setModel(currentChat.getModel());
                        wasMessageRemoved = currentChat.getHistory().addMessage(result);
                        ChatStorage.INSTANCE.save(currentChat);
                        updateUsage();
                    }
                }
                break;
        }

        if(wasMessageRemoved){
            removeFirstMessageFromContent();
            ChatStorage.INSTANCE.save(currentChat);
        }

    }
}

function removeFirstMessageFromContent(){
    let userMsgs = $("#content .user");
    let gptMsgs = $("#content .gpt");
    if(userMsgs.length > 0){
        userMsgs[0].remove();
    }
    if(gptMsgs.length > 0){
        gptMsgs[0].remove();
    }
}

function createIdForImage(imageData){
    return ImageStorage.INSTANCE.addImage(imageData);
}

function isImageAi(model){
    return model == "dall-e-2" || model == "dall-e-3";
}

function addMessageToContent(message, isUser){
    createMessage(message.getContent(), isUser, message.getShortName());
    document.getElementById("promptArea").value = "";
    updateSendBtn();
}

function updateSendBtn(){
    let text = document.getElementById("promptArea").value;
    if(text.length > 0){
        document.getElementById("sendBtn").removeAttribute("disabled");
    } else {
        document.getElementById("sendBtn").setAttribute("disabled", "");
    }
}

async function loadChats(selected=null){
    document.getElementById("chats").innerHTML = "";
    let chats = ChatStorage.INSTANCE.getAllChatUUIDs();
    let selectedUUID = selected != null ? selected.uuid : null;

    for(let c of chats){
        let chat = await ChatStorage.INSTANCE.getChat(c);
        if(c == selectedUUID && c != null){
            addChatToSideMenu(chat, true);
        } else {
            addChatToSideMenu(chat);
        }
    }

}

function addChatToSideMenu(chat, isSelected=false){
    let chatDiv = document.createElement("div");
    chatDiv.id = chat.uuid;
    chatDiv.classList.add("chatBtn");
    let titleSpan = document.createElement("span");
    titleSpan.spellcheck = false;
    titleSpan.innerHTML = chat.getTitle();

    let optionsButton = document.createElement("button");
    optionsButton.innerHTML = "Options";
    optionsButton.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md"><path fill-rule="evenodd" clip-rule="evenodd" d="M3 12C3 10.8954 3.89543 10 5 10C6.10457 10 7 10.8954 7 12C7 13.1046 6.10457 14 5 14C3.89543 14 3 13.1046 3 12ZM10 12C10 10.8954 10.8954 10 12 10C13.1046 10 14 10.8954 14 12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12ZM17 12C17 10.8954 17.8954 10 19 10C20.1046 10 21 10.8954 21 12C21 13.1046 20.1046 14 19 14C17.8954 14 17 13.1046 17 12Z" fill="currentColor"></path></svg>';
    optionsButton.classList.add("optionsBtn");


    optionsButton.onclick = function(e){

        document.addEventListener('click', function(e){
            let options = document.getElementById("options");
            if(!isChildOf(optionsButton, e.target)){
                options.style.display = "none";
                document.removeEventListener('click', this);
            }
        });

        e.stopPropagation();
        let options = document.getElementById("options");
        options.style.display = "block";
        let pos = $(optionsButton).position();
        options.style.left = pos.left + "px";
        options.style.top = pos.top + "px";
        deleteChat = function(){
            ChatStorage.INSTANCE.delete(chat.uuid).then(loadChats);
            options.style.display = "none";
            if(currentChat == chat){
                currentChat = null;
                document.getElementById("content").innerHTML = "";
                document.title = "ChatGPT-4";
            }
        };
        setSystemMessage = function(){
            chat.setSystemMessage();
            options.style.display = "none";
        };
        rename = function(){
            options.style.display = "none";
            let all = $("#" + chat.uuid + " span");
            if(all.length <= 0)return;
            let btnDiv = all[0];
            if(btnDiv == null)return;
            btnDiv.setAttribute("contenteditable", "");
            btnDiv.onkeydown = function(e){
                if(e.key == "Enter"){
                    chat.setTitle(btnDiv.innerText);
                    ChatStorage.INSTANCE.save(chat);
                    btnDiv.removeAttribute("contenteditable");
                    btnDiv.onkeydown = undefined;
                }
            };
        };
    };

    chatDiv.appendChild(titleSpan);
    chatDiv.appendChild(optionsButton);
    chatDiv.addEventListener("click", function(){
        let chats = $(".chatBtn");
        for(let c of chats){
            c.removeAttribute("selected");
        }
        loadChat(chat);
        this.setAttribute("selected", "");
    });
    document.getElementById("chats").appendChild(chatDiv);

    if(isSelected){
        removeAllSelectedChats();
        chatDiv.setAttribute("selected", "");
        loadChat(chat);
    }

}

function removeAllSelectedChats(){
    let chats = $(".chatBtn");
    for(let c of chats){
        c.removeAttribute("selected");
    }
}

async function loadChat(chat){
    removeAllSelectedChats();
    currentChat = chat;
    let messages = chat.getHistory().getMessages();
    let content = document.getElementById("content");
    if(content == null)return;
    content.innerHTML = "";
    for(let m of messages){
        if(!m.isImage() && !m.isUserImage()){
            createMessage(m.getContent(), (m.getRole() == "user"), m.getShortName());
        }else{
            if(m.isUserMessage() && m.isUserImage()){
                createMessageWithAttachment(m, true);
            }else{
                let uid = m.getContent();
                let data = await ImageStorage.INSTANCE.getImage(uid);
                sendResultImage(data.data, m.getShortName());
            }
        }
    }
    
    document.title = chat.getTitle();
}

function modelChange(e){
    if(currentChat != null){
        currentChat.setModel(e.detail);
        ChatStorage.INSTANCE.save(currentChat);
    }else{
        localStorage.setItem("openai-default-model", e.detail);
    }
}

function createMessage(content, user, name){
    let message = document.createElement("div");
    message.classList.add("message");
    let msgHeader = document.createElement("div");
    msgHeader.classList.add("msgHeader");
    if(OpenAI.INSTANCE.isShowProfileImage()){
        let profileImage = document.createElement("img");
        profileImage.classList.add("profileImage");
        if(user){
            message.classList.add("user");
            if(profileImageData){
                profileImage.src = profileImageData;
            }else{
                return;
            }
        } else {
            message.classList.add("gpt");
            profileImage.src = "./icons/favicon90x90.png";
        }
        msgHeader.appendChild(profileImage);
    }
    let msgRole = document.createElement("span");
    msgRole.classList.add("msgRole");
    msgRole.innerHTML = user ? "You" : name;
    msgHeader.appendChild(msgRole);
    message.appendChild(msgHeader);

    let msgContent = document.createElement("div");
    msgContent.classList.add("msgContent");
    writeTextTo(msgContent, content, true);
    message.appendChild(msgContent);

    document.getElementById("content").appendChild(message);
    // message.scrollIntoView();
    document.getElementById("overflowFrame").scrollTo(0, document.getElementById("overflowFrame").scrollHeight);
}

function createMessageWithAttachment(message, user){
    let messageDiv = document.createElement("div");
    messageDiv.classList.add("message");
    messageDiv.classList.add(user ? "user" : "gpt");
    let msgHeader = document.createElement("div");
    msgHeader.classList.add("msgHeader");
    let msgRole = document.createElement("span");
    msgRole.classList.add("msgRole");
    if(OpenAI.INSTANCE.isShowProfileImage()){
        let profileImage = document.createElement("img");
        profileImage.classList.add("profileImage");
        if(user){
            if(profileImageData){
                profileImage.src = profileImageData;
            }else{
                return;
            }
        } else {
            profileImage.src = "./icons/favicon90x90.png";
        }
        msgHeader.appendChild(profileImage);
    }
    msgRole.innerHTML = user ? "You" : message.getShortName();
    msgHeader.appendChild(msgRole);
    messageDiv.appendChild(msgHeader);

    let msgContent = document.createElement("div");
    msgContent.classList.add("msgContent");
    messageDiv.appendChild(msgContent);

    let button = document.createElement("button");
    button.classList.add("attachmentBtn");
    
    let attachmentImg = document.createElement("img");
    attachmentImg.src = "./images/attachment.png";
    attachmentImg.classList.add("attachmentImg");

    let contentDiv = document.createElement("div");
    contentDiv.classList.add("attachmentContent");

    button.appendChild(attachmentImg);
    button.onclick = async function(){
        let imageData = "";
        if(message.isMultipleImages()){
            let canvas = document.createElement("canvas");
    
            let imgD1 = "data:image/png;base64," + (await message.getImage());
            let imgD2 = "data:image/png;base64," + (await message.getMask());

            let img1 = new Image();
            img1.src = imgD1;
            let img2 = new Image();
            img2.src = imgD2;

            await new Promise((resolve, reject)=>{
                img1.onload = function(){
    
                    let ctx = canvas.getContext("2d");
                    canvas.width = img1.width;
                    canvas.height = img1.height;

                    ctx.drawImage(img1, 0, 0);
        
                    imageData = canvas.toDataURL("image/jpg");
                    resolve();
                };
            });

        }else{
            imageData = "data:image/png;base64," + (await message.getImage());
        }
        let img = document.createElement("img");
        img.src = imageData;
        img.classList.add("attachmentImage");
        let modal = document.createElement("dialog");
        modal.classList.add("modal");
        modal.classList.add("showAttachmentDialog");
        modal.style.display = "block";
        modal.innerHTML = "";
        modal.appendChild(img);
        let close = document.createElement("button");
        close.classList.add("closeBtn");
        close.classList.add("close");
        close.innerHTML = "×";
        close.onclick = function(){
            document.body.removeChild(modal);
        };
        modal.appendChild(close);
        document.body.appendChild(modal);
        modal.showModal();
    };

    msgContent.appendChild(button);
    writeTextTo(contentDiv, message.getContent(), true);
    msgContent.appendChild(contentDiv);

    document.getElementById("content").appendChild(messageDiv);
    document.getElementById("overflowFrame").scrollTo(0, document.getElementById("overflowFrame").scrollHeight);
}

function sendResultMessage(content, name){
    let message = document.createElement("div");
    message.classList.add("message");
    message.classList.add("gpt");
    let msgHeader = document.createElement("div");
    msgHeader.classList.add("msgHeader");

    if(OpenAI.INSTANCE.isShowProfileImage()){
        let profileImage = document.createElement("img");
        profileImage.classList.add("profileImage");
        profileImage.src = "./icons/favicon90x90.png";
        msgHeader.appendChild(profileImage);
    }

    let msgRole = document.createElement("span");
    msgRole.classList.add("msgRole");
    msgRole.innerHTML = name;
    msgHeader.appendChild(msgRole);
    message.appendChild(msgHeader);

    let msgContent = document.createElement("div");
    msgContent.classList.add("msgContent");
    writeTextTo(msgContent, content.getContent());
    message.appendChild(msgContent);

    document.getElementById("content").appendChild(message);
    // message.scrollIntoView();
    document.getElementById("overflowFrame").scrollTo(0, document.getElementById("overflowFrame").scrollHeight);
}

let contentData = {};

function sendResultStreamMessage(data, id, name, isFinished=false){
    if(id == undefined){
        id = uuidv4();
        let message = document.createElement("div");
        message.classList.add("message");
        message.classList.add("gpt");
        let msgHeader = document.createElement("div");
        msgHeader.classList.add("msgHeader");
        if(OpenAI.INSTANCE.isShowProfileImage()){
            let profileImage = document.createElement("img");
            profileImage.classList.add("profileImage");
            profileImage.src = "./icons/favicon90x90.png";
            msgHeader.appendChild(profileImage);
        }

        let msgRole = document.createElement("span");
        msgRole.classList.add("msgRole");
        msgRole.innerHTML = name;
        msgHeader.appendChild(msgRole);
        message.appendChild(msgHeader);

        let msgContent = document.createElement("div");
        msgContent.classList.add("msgContent");

        contentData[id] = {"content": data, "msgContent": msgContent};

        message.appendChild(msgContent);
        document.getElementById("content").appendChild(message);
        document.getElementById("overflowFrame").scrollTo(0, document.getElementById("overflowFrame").scrollHeight);
        writeTextTo(msgContent, format(contentData[id]["content"]), true);
        return id;
    }else{
        contentData[id]["content"] += data;
        let endRegex = /```\S{1,}/gm;
        if(endRegex.test(contentData[id]["content"])){
            for(let m of contentData[id]["content"].match(endRegex)){
                if(contentData[id]["content"].endsWith(m)){
                    contentData[id]["content"] += "\n";
                }
            }
        }
        writeTextTo(contentData[id]["msgContent"], format(contentData[id]["content"]), true);
        console.log(contentData[id]["content"]);
        if(isFinished){
            delete contentData[id];
        }
    }
}

function format(text){
    return text.replace(/(?<=[a-zA-Z|,|;])(?<!\s)(\d{1,})/gim, " $1");
}

async function sendLoadingMessage(asyncFunction){
    let styles = JSON.parse(`
    {
        "#canvas":{
            "width": "30%"
        },
        "position": "fixed",
        "top": "0px",
        "width": "12%",
        "font-size": "60%",
        "z-index": "1000000"
    }
    `);

    let styleElement = document.createElement("style");
    styleElement.innerText = `
        #waitingDialog{
            position: fixed !important;
            top: 0px !important;
            width: 12% !important;
            font-size: 60% !important;
            z-index: 1000000 !important;
        }

        #waitingDialog canvas {
            width: 30% !important;
        }
    `;
    document.body.appendChild(styleElement);

    if(typeof asyncFunction == "function"){
        let result = await wait(lang.get("messages.wait.receivingAIResponse"), asyncFunction, false);
        document.body.removeChild(styleElement);
        return result;
    }else{
        let result = await wait(lang.get("messages.wait.receivingAIResponse"), async ()=>await asyncFunction, false);
        document.body.removeChild(styleElement);
        return result;
    }
}

function sendResultImage(imgUrl, name){
    let message = document.createElement("div");
    message.classList.add("message");
    message.classList.add("gpt");
    let msgHeader = document.createElement("div");
    msgHeader.classList.add("msgHeader");
    
    if(OpenAI.INSTANCE.isShowProfileImage()){
        let profileImage = document.createElement("img");
        profileImage.classList.add("profileImage");
        profileImage.src = "./icons/favicon90x90.png";
        msgHeader.appendChild(profileImage);
    }
    
    let msgRole = document.createElement("span");
    msgRole.classList.add("msgRole");
    msgRole.innerHTML = name;
    msgHeader.appendChild(msgRole);
    message.appendChild(msgHeader);

    let msgContent = document.createElement("div");
    msgContent.classList.add("msgContent");

    let img = document.createElement("img");
    img.src = imgUrl;
    img.classList.add("aiImage");

    msgContent.appendChild(img);

    message.appendChild(msgContent);

    document.getElementById("content").appendChild(message);
    // message.scrollIntoView();
    document.getElementById("overflowFrame").scrollTo(0, document.getElementById("overflowFrame").scrollHeight);
}

function copyCode(code, btn){
    btn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-sm"><path fill-rule="evenodd" clip-rule="evenodd" d="M18.0633 5.67375C18.5196 5.98487 18.6374 6.607 18.3262 7.06331L10.8262 18.0633C10.6585 18.3093 10.3898 18.4678 10.0934 18.4956C9.79688 18.5234 9.50345 18.4176 9.29289 18.2071L4.79289 13.7071C4.40237 13.3166 4.40237 12.6834 4.79289 12.2929C5.18342 11.9023 5.81658 11.9023 6.20711 12.2929L9.85368 15.9394L16.6738 5.93664C16.9849 5.48033 17.607 5.36263 18.0633 5.67375Z" fill="currentColor"></path></svg>Copied!';
    setTimeout(()=>{
        btn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-sm"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 4C10.8954 4 10 4.89543 10 6H14C14 4.89543 13.1046 4 12 4ZM8.53513 4C9.22675 2.8044 10.5194 2 12 2C13.4806 2 14.7733 2.8044 15.4649 4H17C18.6569 4 20 5.34315 20 7V19C20 20.6569 18.6569 22 17 22H7C5.34315 22 4 20.6569 4 19V7C4 5.34315 5.34315 4 7 4H8.53513ZM8 6H7C6.44772 6 6 6.44772 6 7V19C6 19.5523 6.44772 20 7 20H17C17.5523 20 18 19.5523 18 19V7C18 6.44772 17.5523 6 17 6H16C16 7.10457 15.1046 8 14 8H10C8.89543 8 8 7.10457 8 6Z" fill="currentColor"></path></svg>Copy code';
    }, 2*1000);
    copyTextToClipboard(code);
}

function copyTextToClipboard(text) {
    if (!navigator.clipboard) {
        var textArea = document.createElement("textarea");
        textArea.value = text;
        
        // Avoid scrolling to bottom
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
        }

        document.body.removeChild(textArea);
        return;
    }

    navigator.clipboard.writeText(text).then(function() {
    }, function(err) {
        console.error('Async: Could not copy text: ', err);
    });
}

let codeIndex = 0;

function writeTextTo(element, text, instant=!OpenAI.INSTANCE.isNatrualTyping()){
    let textContent = "";
    let currentPos = 0;
    let currentElementToAddTo = document.createElement("div");
    while(text.endsWith("`")){
        text = text.substring(0, text.length-1);
    }

    element.innerHTML = "";
    element.appendChild(currentElementToAddTo);
    
    const updateElement = (content)=>{
        
        let scrollDown = false;

        let height = $("#overflowFrame").scrollTop() + $("#overflowFrame").innerHeight();

        if(height >= $("#overflowFrame")[0].scrollHeight - 10)scrollDown = true;

        currentElementToAddTo.innerHTML = renderInStyle(content).replace(/<a(.*?)>(.*?)<\/a>/gi, '<a$1 class="link" target="_blank">$2</a>');

        if(scrollDown){
            document.getElementById("overflowFrame")
                .scrollTo(0, document.getElementById("overflowFrame").scrollHeight);
        }
    }
    if(!instant){
        let id = setInterval(function(){
            if(currentPos >= text.length){
                clearInterval(id);
                return;
            }
            let c = text[currentPos];
            currentPos++;
            textContent += c;
            updateElement(textContent);
        }, 1000/200);
    }else{
        updateElement(text);
    }

}

function loadLanguageModule(language){
    let allScripts = document.getElementsByTagName("script");

    for(let s of allScripts){
        if(s.src == "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/" + language + ".min.js"){
            return;
        }
    }
    let script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/" + language + ".min.js";
    document.head.appendChild(script);
}

document.addEventListener('modelChange', modelChange);

function loadCosts(data){
    let imageAiRequestV2 = data["requests"]["dall-e-2"];
    let imageAiRequestV3 = data["requests"]["dall-e-3"];

    let models = [
        "gpt-4-0613",
        "gpt-3.5-turbo-0125",
        "gpt-3.5-turbo-1106",
        "gpt-3.5-turbo-16k-0613",
        "gpt-3.5-turbo-0613",
        "gpt-4-0125-preview",
        "gpt-4-1106-vision-preview",
        "gpt-4-1106-preview",
        "dall-e-2",
        "dall-e-3"
    ];

    let generatedTokens = [];
    let contextTokens = [];

    for(let m of models){
        if(m == "dall-e-2" || m == "dall-e-3"){
            continue;
        }
        generatedTokens.push(data["generatedTokens"][m]);
        contextTokens.push(data["contextTokens"][m]);
    }

    generatedTokens.push(imageAiRequestV2);
    generatedTokens.push(imageAiRequestV3);
    contextTokens.push(0);
    contextTokens.push(0);


    let cost = calculateTotalCost(models, contextTokens, generatedTokens);
}

document.addEventListener('documentLoaded', function(){

    document.getElementById("promptArea").addEventListener("focusin", function(){
        document.getElementById("promptBar").classList.add("focused");
        document.getElementById("promptArea").classList.add("focused");
    });

    document.getElementById("promptArea").addEventListener("focusout", function(){
        document.getElementById("promptBar").classList.remove("focused");
        document.getElementById("promptArea").classList.remove("focused");
    });

});