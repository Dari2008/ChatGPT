class Message{

    constructor(role, content, isImage, isUserImages = false){
        this.role = role;
        this.content = content;
        this.isImagevar = isImage;
        this.isUserImages = isUserImages;
        this.imageId = null;
        this.maskId = null;
    }

    toJson(){
        return {
            "role": this.role,
            "content": this.content,
            "isImage": this.isImagevar,
            "model": this.model,
            "isUserImage": this.isUserImages,
            "imageId": this.imageId,
            "maskId": this.maskId
        }
    }

    async toShortJson(){
        if(this.isUserImages){
            return {
                "role": this.role,
                "content": [
                    {
                        "type": "text",
                        "text": this.content
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": "https://tools.frobeen.com/chatGPT/phpData/tmpImages/" + this.imageId + ".jpg",
                        }
                    }
                ],
                "imageData": await this.getImage(),
                "id": this.imageId
            };
        }else{
            return {
                "role": this.role,
                "content": this.content
            }
        }
    }

    async getImage(){
        let image = await ImageStorage.INSTANCE.getImage(this.imageId);
        return image.data.replace(/data:image\/(jpg|png|jpeg);base64,/gi, "");
    }

    async getMask(){
        let image = await ImageStorage.INSTANCE.getImage(this.maskId);
        return image.data.replace(/data:image\/(jpg|png|jpeg);base64,/gi, "");
    }

    isMultipleImages(){
        return this.maskId != null && this.imageId != null;
    }

    changeToUserImageMessage(imageId, maskId){
        this.imageId = imageId;
        this.maskId = maskId;
        this.isUserImages = true;
    }

    setIsImage(isImage){
        this.isImagevar = isImage;
    }

    isImage(){
        return this.isImagevar;
    }

    isUserImage(){
        return this.isUserImages;
    }

    getShortName(){
        let model = this.model.toLowerCase();
        if(model.includes("gpt-4")){
            return "GPT-4";
        }else if(model.includes("gpt-3")){
            return "GPT-3";
        }else if(model.includes("dall-e-2")){
            return "DALL⋅E 2";
        }else if(model.includes("dall-e-3")){
            return "DALL⋅E 3";
        }else{
            return "Unknown";
        }
    }

    setModel(model){
        this.model = model;
    }

    getRole(){
        return this.role;
    }

    getContent(){
        return this.content;
    }

    setRole(role){
        this.role = role;
    }

    isUserMessage(){
        return this.role == "user";
    }

    setContent(content){
        this.content = content;
    }

    toHTML(){
        return this.content;
    }

    toString(){
        return this.role + ": " + this.content;
    }

    static fromJson(json){
        let msg = new Message(json.role, json.content, json.isImage);
        if(json.isUserImage){
            msg.changeToUserImageMessage(json.imageId, json.maskId);
        }
        
        if(json.model){
            msg.setModel(json.model);
        }else{
            if(json.isImage){
                msg.setModel("dall-e-3");
            }else{
                msg.setModel("gpt-3");
            }
        }
        return msg;
    }

}