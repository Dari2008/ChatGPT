class MessageHistory{
    constructor(){
        this.messages = [];
        this.systemMessage = null;
    }

    addMessage(message){
        this.messages.push(message);
        if(this.messages.length > OpenAI.INSTANCE.getMaxMessageChatCount() && OpenAI.INSTANCE.getMaxMessageChatCount() != "auto"){
            this.messages.shift();
            return true
        }
        return false;
    }

    getMessages(){
        return this.messages;
    }

    clear(){
        this.messages = [];
    }

    getSystemMessage(){
        return this.systemMessage;
    }

    setSystemMessage(content){
        systemMessage = new Message("system", content);
    }

    async promptOpenAI(){
        let openAI = OpenAI.INSTANCE;
        let result = await openAI.prompt(this.messages);
        this.clear();
        return result;
    }

    static fromJson(json){
        let history = new MessageHistory();
        if(OpenAI.INSTANCE.getMaxMessageLoadCount() != "auto"){
            // wegen Antwort und Anfrage von user sind es imer 2 er pare
            json.messages = json.messages.splice(json.messages.length - OpenAI.INSTANCE.getMaxMessageLoadCount(), json.messages.length);
        }
        for(let msg of json.messages){
            history.addMessage(Message.fromJson(msg));
        }
        if(json.systemMessage != null){
            history.setSystemMessage(json.systemMessage.content);
        }
        return history;
    }

    toJson(){
        let json = {
            messages: [],
            systemMessage: this.systemMessage!=null?this.systemMessage.toJson():null
        };
        for(let msg of this.messages){
            json.messages.push(msg.toJson());
        }
        return json;
    }
}