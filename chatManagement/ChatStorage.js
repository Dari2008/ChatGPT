class ChatStorage{

    constructor(){
        this.db = null;
        this.uuids = [];
        let request = indexedDB.open("Chats", 1);
        request.onerror = function(e){
            ChatStorage.ERROR = true;
        }

        request.onupgradeneeded = function(e){
            this.db = e.target.result;
            let objectStore = this.db.createObjectStore("chats", {keyPath: "uuid"});
            objectStore.createIndex("title", "title", {unique: false});
            objectStore.createIndex("history", "history", {unique: false});
            objectStore.createIndex("model", "model", {unique: false});

        }.bind(this);

        request.onsuccess = function(e){
            this.db = e.target.result;
            this.loadChats();
        }.bind(this);

        document.addEventListener("beforeunload", function(e){
            if(this.db != null)this.db.close();
        }.bind(this));

    }

    async loadChats(){
        const trans = this.db.transaction("chats", "readwrite");
        const store = trans.objectStore("chats");
        let request = store.getAll();
        request.onsuccess = function(e){
            let result = e.target.result;
            this.uuids = [];
            for(let chat of result){
                this.uuids.push(chat.uuid);
            }
        }.bind(this);
    }

    async addChat(chat){
        if(ChatStorage.ERROR)return;
        const trans = this.db.transaction("chats", "readwrite");
        const store = trans.objectStore("chats");

        let request = store.put(chat.toJson());
        request.onerror = function(e){
            (e);
        }
        let pr = new Promise(function(resolve, reject){
            request.onsuccess = function(e){
                this.uuids.push(chat.uuid);
                resolve();
            }.bind(this);
        }.bind(this));
        return pr;
    }

    getAllChatUUIDs(){
        if(ChatStorage.ERROR)return;
        return this.uuids;
    }

    async getChat(uuid){
        if(ChatStorage.ERROR)return;

        const trans = this.db.transaction("chats", "readwrite");
        const store = trans.objectStore("chats");

        let request = store.get(uuid);

        let pr = new Promise(function(resolve, reject){
            request.onsuccess = function(e){
                let result = e.target.result;
                if(result == null){
                    reject(null);
                }
                resolve(Chat.fromJson(result));
            }
        });

        return pr;
    }

    async save(chat) {
        if (ChatStorage.ERROR) return;

        try {
            const trans = this.db.transaction("chats", "readwrite");
            const store = trans.objectStore("chats");

            if (this.uuids.indexOf(chat.uuid) === -1) {
                let request = store.add(chat.toJson());
                let pr = new Promise(function (resolve, reject) {
                    request.onerror = function (e) {
                        reject();
                    };
                    request.onsuccess = function () {
                        this.uuids.push(chat.uuid);
                        resolve();
                    }.bind(this);
                }.bind(this));
                return pr;
            } else {
                let request = store.openCursor();
                let pr = new Promise(function (resolve, reject) {
                    request.onsuccess = function (e) {
                        let cursor = e.target.result;
                        if (cursor) {
                            if (cursor.value.uuid === chat.uuid) {
                                cursor.update(chat.toJson());
                                resolve();
                                return;
                            }
                            cursor.continue();
                        }
                    };
                    request.onerror = function (e) {
                        reject();
                    };
                }.bind(this));
                return pr;
            }
        } catch (error) {
        }
    }

    async delete(uuid){
        if(ChatStorage.ERROR)return;

        let chat = await this.getChat(uuid);
        
        const trans = this.db.transaction("chats", "readwrite");
        const store = trans.objectStore("chats");

        let request = store.delete(uuid);
        let pr = new Promise(function(resolve, reject){
            request.onsuccess = function(e){
                let index = this.uuids.indexOf(uuid);
                if(index != -1){
                    this.uuids.splice(index, 1);
                }

                for(let msg of chat.history.getMessages()){
                    if(msg.isImage()){
                        ImageStorage.INSTANCE.removeImage(msg.getContent());
                    }
                }
                resolve();
            }.bind(this);
            
            request.onerror = function(e){
                reject(e);
            }
        }.bind(this));

        return pr;
    }

    async deleteAll(){
        if(ChatStorage.ERROR)return;
        await this.loadChats();
        for(let uuid of this.uuids){
            await this.delete(uuid);
        }
    }
        

}

ChatStorage.DB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
ChatStorage.ERROR = false;
ChatStorage.INSTANCE = new ChatStorage();