class OpenAI{

    constructor(){
        this.model = "gpt-4";
        this.BASE_URL = "https://api.openai.com/v1/chat/completions";
        this.isStreaming = false;
        this.isNatrualTypingBool = true;
        this.maxMessageLoadCount = "auto";
        this.maxMessageChatCount = "auto";
        this.maxMessageSendCount = "auto";
        this.showProfileImage = true;
    }

    setModel(model){
        this.model = model;
    }

    getModel(){
        return this.model;
    }

    setAccessToken(access_Token){
        this.access_Token = access_Token;
    }

    getAccessToken(){
        return this.access_Token;
    }

    setNatrualTyping(isNatrualTyping){
        this.isNatrualTypingBool = isNatrualTyping;
    }

    isNatrualTyping(){
        return this.isNatrualTypingBool;
    }

    setStream(isStream){
        this.isStreaming = isStream;
    }

    isStream(){
        return this.isStreaming;
    }

    setMaxMessageLoadCount(count){
        this.maxMessageLoadCount = count;
    }

    getMaxMessageLoadCount(){
        return this.maxMessageLoadCount;
    }

    setMaxMessageChatCount(count){
        this.maxMessageChatCount = count;
    }

    getMaxMessageChatCount(){
        return this.maxMessageChatCount;
    }

    setMaxMessageSendCount(count){
        this.maxMessageSendCount = count!="auto"?count+1:count;
    }

    getMaxMessageSendCount(){
        return this.maxMessageSendCount;
    }

    setShowProfileImage(show){
        this.showProfileImage = show;
    }

    isShowProfileImage(){
        return this.showProfileImage;
    }

    async promptMessages(messages, nextChunkAvailable = (data)=>{}){
        if(!this.isStreaming){
            return await this.promptMessagesNoStream(messages);
        }else{
            this.promptMessagesStream(messages, nextChunkAvailable);
            return {ok: false, stream: true};
        }
    }

    async promptMessagesStream(messages, nextChunkAvailable){

        if(messages.length > this.getMaxMessageSendCount() && this.getMaxMessageSendCount() != "auto" && messages instanceof Array){
            messages = messages.filter(m => m instanceof Message).splice(messages.length - this.getMaxMessageSendCount(), messages.length);
        }

        let messageJson = [];
        for(let msg of messages){
            if(!(msg instanceof Message))continue;
            if(msg.isImage())continue;
            if(msg.isUserImage())continue;
            messageJson.push(await msg.toShortJson());
        }

        let encoder = new TextDecoder();

        let result = await fetch(DATAURL, {
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Credentials": true,
                "Auth": "Bearer " + OpenAI.INSTANCE.getAccessToken(),
            },
            "method": "POST",
            "mode": "cors",
            "body": JSON.stringify({
                "model": this.model,
                "messages":messageJson,
                "actionId": 8
            }),
            "processData": false
        }).then(e => e.body.getReader());

        while(true){

            let {done, value} = await result.read();
            if(done)break;

            let chunkData = encoder.decode(value).split("\n").filter(s => s.length > 0).filter(s => s != undefined);
            for(let data of chunkData){
                data = JSON.parse(data);
                if(data.ok === false){
                    alert(lang.get(data.langPath), AlertType.ERROR, 10000);
                    nextChunkAvailable({}, true);
                    return;
                }
                if(data.finished === true){
                    nextChunkAvailable(data, true);
                    return;
                }
                nextChunkAvailable(data, false);
            }

        }
        return;
    }

    async promptMessagesNoStream(messages){
        if(messages.length > this.getMaxMessageSendCount() && this.getMaxMessageSendCount() != "auto" && messages instanceof Array){
            messages = messages.filter(m => m instanceof Message).splice(messages.length - this.getMaxMessageSendCount(), messages.length);
        }

        let messageJson = [];
        for(let msg of messages){
            if(!(msg instanceof Message))continue;
            if(msg.isImage())continue;
            if(msg.isUserImage())continue;
            messageJson.push(await msg.toShortJson());
        }

        let result = await(await fetch(DATAURL, {
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Credentials": true,
                "Auth": "Bearer " + OpenAI.INSTANCE.getAccessToken(),
            },
            "method": "POST",
            "mode": "cors",
            "body": JSON.stringify({
                "model": this.model,
                "messages":messageJson,
                "actionId": 5
            }),
            "processData": false
        })).json();

        if(result.ok === true){
            let choices = result.choices;
            if(choices.length == 0)return {ok: false, status: 400, statusText: "No response from OpenAI"};
            return {"message": Message.fromJson(choices[0].message), "ok": true};
        }else{
            alert(lang.get(result.langPath), AlertType.ERROR, 100000);
            return {ok: false, status: result.status, statusText: result.statusText};
        }
    }

    async promptHistoryWithImage(history, newMessage, nextChunkAvailable = (data)=>{}){
        if(!this.isStreaming){
            return await this.promptHistoryNoStream(history, newMessage);
        }else{
            this.promptHistoryStream(history, newMessage, nextChunkAvailable);
            return {ok: false, stream: true};
        }
    }

    async promptHistoryNoStream(history, newMessage){
        let message = await newMessage.toShortJson();

        let messages = [];

        messages.push(message);

        let result = await(await fetch(DATAURL, {
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Credentials": true,
                "Auth": "Bearer " + OpenAI.INSTANCE.getAccessToken(),
            },
            "method": "POST",
            "mode": "cors",
            "body": JSON.stringify({
                "model": this.model,
                "messages": messages,
                "actionId": 5
            })
        })).json();

        if(result.ok === true){
            let choices = result.choices;
            if(choices.length == 0)return {ok: false, status: 400, statusText: "No response from OpenAI"};
            return {"message": Message.fromJson(choices[0].message), "ok": true};
        }else{
            alert(lang.get(result.langPath), AlertType.ERROR, 100000);
            return {ok: false, status: result.status, statusText: result.statusText};
        }
    }

    async promptHistoryStream(history, newMessage, nextChunkAvailable = (data)=>{}){
        let message = await newMessage.toShortJson();

        let messages = [];

        messages.push(message);
        
        let encoder = new TextDecoder();

        let result = await fetch(DATAURL, {
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Credentials": true,
                "Auth": "Bearer " + OpenAI.INSTANCE.getAccessToken(),
            },
            "method": "POST",
            "mode": "cors",
            "body": JSON.stringify({
                "model": this.model,
                "messages": messages,
                "actionId": 5
            })
        }).then(e => e.body.getReader());
        


        while(true){
            let {done, value} = await result.read();
            if(done)break;
            let chunkData = encoder.decode(value).split("\n").filter(s => s.length > 0).filter(s => s != undefined);
            for(let data of chunkData){
                data = JSON.parse(data);
                if(data.ok === false){
                    alert(lang.get(data.langPath), AlertType.ERROR, 10000);
                    nextChunkAvailable({}, true);
                    return;
                }
                if(data.finished === true){
                    nextChunkAvailable(data, true);
                    return;
                }
                nextChunkAvailable(data, false);
            }
        }
    }

    async promptImage(prompt){

        let result = await (await fetch(DATAURL, {
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Credentials": true,
                "Auth": "Bearer " + OpenAI.INSTANCE.getAccessToken(),
            },
            "method": "POST",
            "mode": "cors",
            "body": JSON.stringify({
                "model": this._validateModel(this.model),
                "prompt": prompt.getContent(),
                "response_format": "b64_json",
                "actionId": 4
            })
        })).json();



        if(result.ok === true){
            if(result.data.length <= 0)return {ok: false, status: 400, statusText: "No response from OpenAI"};
            return {ok: true, data: result.data[0].b64_json};
        }
        alert(lang.get(result.langPath), AlertType.ERROR, 3000);
        return {ok: false, status: 400, statusText: "No response from OpenAI"};

    }

    async promptImageWithImage(message){
        let result = await (await fetch(DATAURL, {
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Credentials": true,
                "Auth": "Bearer " + OpenAI.INSTANCE.getAccessToken(),
            },
            "method": "POST",
            "mode": "cors",
            "body": JSON.stringify({
                "model": "dall-e-2",
                "image": await message.getImage(),
                "mask": await message.getMask(),
                "prompt": message.getContent(),
                "actionId": 7
            })
        })).json();

        if(result.ok === true){
            if(result.data.length <= 0)return {ok: false, status: 400, statusText: "No response from OpenAI"};
            return {ok: true, data: result.data[0].b64_json};
        }
        alert(lang.get(result.langPath), AlertType.ERROR, 3000);
        return {ok: false, status: 400, statusText: "No response from OpenAI"};
    }
    
    _validateModel(model){
        if(model != "dall-e-3" && model != "dall-e-2")return "dall-e-2";
        return model;
    }


    async promptHistory(history, nextChunkAvailable = ()=>{}){
        let messages = [...history.getMessages()];
        if(messages.length > this.getMaxMessageSendCount() && this.getMaxMessageSendCount() != "auto" && messages instanceof Array){
            messages = messages.filter(m => m instanceof Message).splice(messages.length - this.getMaxMessageSendCount(), messages.length);
        }
        if(history.getSystemMessage()!=null)messages.unshift(history.getSystemMessage());
        let response = await this.promptMessages(messages, nextChunkAvailable);
        return response;
    }

    async loginOrRegisterUser(credentials){
        let cr = credentials.credential;
        let result = await(await fetch(DATAURL, {
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Credentials": true,
                "Auth": "Bearer " + cr,
            },
            "method": "POST",
            "mode": "cors",
            "body": JSON.stringify({
                "actionId": 9
            })
        })).json();

        if(result == undefined){
            return {ok: false, "message": "No response from Server"};
        }else{
            if(!result.ok)return {ok: false, "message": result.message};
            let info = result.info;
            this.access_Token = cr;
            return {ok: true, "message": result.langPath, registered: result.registered, name: info.name, email: info.email, imageData: info.imageData};
        }
    }

}

OpenAI.INSTANCE = new OpenAI();
OpenAI.DEFAULT_MODEL = localStorage.getItem("openai-default-model") == null|undefined? "gpt-4" : localStorage.getItem("openai-default-model");