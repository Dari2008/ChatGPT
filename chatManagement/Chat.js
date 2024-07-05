class Chat{

    constructor(uuid = uuidv4(), model = OpenAI.DEFAULT_MODEL){
        this.history = new MessageHistory();
        this.title = "chat";
        this.uuid = uuid;
        this.model = model;
    }

    async prompt(message, nextChunkAvailable = ()=>{}){
        OpenAI.INSTANCE.setModel(this.model);
        message.setModel(this.model);
        let result = await OpenAI.INSTANCE.promptHistory(this.history, nextChunkAvailable);
        if(result === undefined)return undefined;
        if(result === null)return null;
        if(result.ok === true){
            return result["message"];
        }
        return result;
    }

    async promptWithImage(message, nextChunkAvailable = ()=>{}){
        OpenAI.INSTANCE.setModel(this.model);
        message.setModel(this.model);
        let result = await OpenAI.INSTANCE.promptHistoryWithImage(this.history, message, nextChunkAvailable);
        if(result === undefined)return undefined;
        if(result === null)return null;
        if(result.ok === true){
            return result["message"];
        }
        return result;
    }

    async promptImageWithImage(message){
        OpenAI.INSTANCE.setModel(this.model);
        let result = await OpenAI.INSTANCE.promptImageWithImage(message);
        if(result === undefined)return undefined;
        if(result === null)return null;
        return result;
    }

    async promptImage(prompt){
        OpenAI.INSTANCE.setModel(this.model);
        let result = await OpenAI.INSTANCE.promptImage(prompt);
        if(result === undefined)return undefined;
        if(result === null)return null;
        return result;
    }

    setModel(model){
        this.model = model;
        OpenAI.DEFAULT_MODEL = model;
        localStorage.setItem("openai-default-model", model);
    }

    getModel(){
        return this.model;
    }

    getHistory(){
        return this.history;
    }

    setTitle(title){
        this.title = title;
    }

    getTitle(){
        return this.title;
    }

    toJson(){
        return {
            "title": this.title, 
            "history":this.history.toJson(),
            "model": this.model,
            "uuid": this.uuid
        };
    }

    static fromJson(json){
        if(json == null)return null;
        if(json.uuid == null)return null;
        if(json.history == null)return null;
        if(json.model == null)return null;
        let chat = new Chat(json.uuid);
        chat.setTitle(json.title);
        chat.history = MessageHistory.fromJson(json.history);
        chat.model = json.model;
        return chat;
    }

}