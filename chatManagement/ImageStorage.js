class ImageStorage{
    constructor(){
        this.db = null;
        this.uids = [];
        let request = indexedDB.open("Images", 1);
        request.onerror = function(e){
            ImageStorage.ERROR = true;
            console.log(e);
        }

        request.onupgradeneeded = function(e){
            this.db = e.target.result;
            let objectStore = this.db.createObjectStore("images", {keyPath: "uuid"});
            objectStore.createIndex("data", "data", {unique: false});

        }.bind(this);

        request.onsuccess = function(e){
            this.db = e.target.result;
            this.loadAllImageUids();
        }.bind(this);

        document.addEventListener("beforeunload", function(e){
            if(this.db != null)this.db.close();
        }.bind(this));

    }

    async getImage(uid){
        if(ImageStorage.ERROR)return;
        const trans = this.db.transaction("images", "readwrite");
        const store = trans.objectStore("images");

        let request = store.get(uid);

        let pr = new Promise((resolve, reject)=>{
            request.onsuccess = function(e){
                resolve(e.target.result);
            }
            request.onerror = function(e){
                reject(e);
            }
        });
        return pr;
    }

    loadAllImageUids(){
        if(ImageStorage.ERROR)return;

        const trans = this.db.transaction("images", "readwrite");
        const store = trans.objectStore("images");
        
        let request = store.getAll();
        request.onsuccess = function(e){
            let result = e.target.result;
            for(let image of result){
                this.uids.push(image.uuid);
            }
        }.bind(this);

    }

    addImage(data){
        if(ImageStorage.ERROR)return null;
        let uid = this._uuidv4();

        while(this.uids.includes(uid)){
            uid = this._uuidv4();
        }
        
        const trans = this.db.transaction("images", "readwrite");
        const store = trans.objectStore("images");

        let request = store.put({uuid: uid, data: data});
        request.onerror = function(e){
            console.log(e);
        }
        
        return uid;
    }

    async removeImage(uid){
        if(ImageStorage.ERROR)return

        
        const trans = this.db.transaction("images", "readwrite");
        const store = trans.objectStore("images");

        let request = store.delete(uid);
    }

    _uuidv4(){
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

}

ImageStorage.ERROR = false;
ImageStorage.INSTANCE = new ImageStorage();