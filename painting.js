const getSizeOfImage = (img)=>{
    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    let data = canvas.toDataURL("image/jpeg");
    return data.length;
};

const reset = ()=>{
    for(let i = 0; i < MASK_DATA.length; i++){
        for(let j = 0; j < MASK_DATA[i].length; j++){
            MASK_DATA[i][j] = false;
        }
    }
    drawMask();
};

const invert = ()=>{
    for(let i = 0; i < MASK_DATA.length; i++){
        for(let j = 0; j < MASK_DATA[i].length; j++){
            MASK_DATA[i][j] = !MASK_DATA[i][j];
        }
    }
    drawMask();
};

const setBrushSize = ()=>{
    let size = document.getElementById("areaOfAffectSize").value;
    if(size < 1 || size > 20){
        alert(lang.get("messages.error.brushSizeMustBeBetween1and20"), AlertType.ERROR, 3000);
        return;
    }
    BRUSH_SIZE = size;
};

const drawMask = ()=>{
    ctx.clearRect(0, 0, mask.width, mask.height);
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, mask.width, mask.height);
    ctx.fill();
    for(let i = 0; i < MASK_DATA.length; i++){
        for(let j = 0; j < MASK_DATA[i].length; j++){
            if(MASK_DATA[i][j]){
                ctx.clearRect(i*RECTS_WIDTH_PX, j*RECTS_HEIGHT_PX, RECTS_WIDTH_PX, RECTS_HEIGHT_PX);
            }
        }
    }
};

const updateUpload = (model)=>{
    if(model == "dall-e-2"){
        enableCanvas();
        enableUploadButton();
    }else if(model == "gpt-4-vision-preview"){
        disableCanvas();
        enableUploadButton();
    }else{
        disableUploadButton();
    }
};

const getDimensionOfImage = (imgData, callback)=>{
    let img = new Image();
    img.onload = function(){
        callback({width: img.width, height: img.height});
    };
    img.src = imgData;
};

const checkForIsFalse = (x, y)=>{
    x = mapValues(x, 0, $("#mask").width(), 0, mask.width);
    y = mapValues(y, 0, $("#mask").height(), 0, mask.height);

    let rectX = Math.floor(x / RECTS_WIDTH_PX);
    let rectY = Math.floor(y / RECTS_HEIGHT_PX);

    if(rectX < 0 || rectY < 0 || rectX >= MASK_DATA.length || rectY >= MASK_DATA[0].length)return;

    if(MASK_DATA[rectX][rectY]){
        wasAtStartFalse = false;
    }else{
        wasAtStartFalse = true;
    }
}

const mouseMove = (e)=>{
    if(isMouseDown){
        if(e instanceof MouseEvent){
            let x=e.offsetX,y=e.offsetY;
            mouseMoveWithBrush(x, y)
        }else{
            let x=e.touches[0].offsetX,y=e.touches[0].offsetY;
            mouseMoveWithBrush(x, y)
        }
    }
};

function convertJpgToPng(jpgUrl, callback) {
    var img = new Image();
    img.onload = function() {
        var canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        var pngDataUrl = canvas.toDataURL('image/jpeg');
        callback(pngDataUrl);
    };
    img.src = jpgUrl;
}

const mouseMoveWithBrush = (x, y)=>{
    x = mapValues(x, 0, $("#mask").width(), 0, mask.width);
    y = mapValues(y, 0, $("#mask").height(), 0, mask.height);

    x = Math.floor(x / RECTS_WIDTH_PX);
    y = Math.floor(y / RECTS_HEIGHT_PX);

    for(let xx = 0-Math.floor(BRUSH_SIZE/2); xx < Math.ceil(BRUSH_SIZE/2); xx++){
        for(let yy = 0-Math.floor(BRUSH_SIZE/2); yy < Math.ceil(BRUSH_SIZE/2); yy++){
            if(xx + x < 0 || yy + y < 0 || xx + x >= MASK_DATA.length || yy + y >= MASK_DATA[0].length)continue;
            mouseMoveXY(x + xx, y + yy, true);
        }
    }
};

const mouseMoveXY = (x, y, isMapped=false)=>{
    let rectX = 0;
    let rectY = 0;
    if(!isMapped){
        x = mapValues(x, 0, $("#mask").width(), 0, mask.width);
        y = mapValues(y, 0, $("#mask").height(), 0, mask.height);


        rectX = Math.floor(x / RECTS_WIDTH_PX);
        rectY = Math.floor(y / RECTS_HEIGHT_PX);
    }else{
        rectX = x;
        rectY = y;
    }

    if(rectX < 0 || rectY < 0 || rectX >= MASK_DATA.length || rectY >= MASK_DATA[0].length)return;

    if(wasAtStartFalse){
        if(MASK_DATA[rectX][rectY])return;
        MASK_DATA[rectX][rectY] = true;
    }else{
        if(!MASK_DATA[rectX][rectY])return;
        MASK_DATA[rectX][rectY] = false;
    }

    if(MASK_DATA[rectX][rectY]){
        ctx.clearRect(rectX * RECTS_WIDTH_PX, rectY * RECTS_HEIGHT_PX, RECTS_WIDTH_PX, RECTS_HEIGHT_PX);
        ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
        ctx.fillRect(rectX * RECTS_WIDTH_PX, rectY * RECTS_HEIGHT_PX, RECTS_WIDTH_PX, RECTS_HEIGHT_PX);
        ctx.fill();
    }else{
        ctx.clearRect(rectX * RECTS_WIDTH_PX, rectY * RECTS_HEIGHT_PX, RECTS_WIDTH_PX, RECTS_HEIGHT_PX);
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(rectX * RECTS_WIDTH_PX, rectY * RECTS_HEIGHT_PX, RECTS_WIDTH_PX, RECTS_HEIGHT_PX);
        ctx.fill();
    }

};

const mouseUp = (e)=>{
    isMouseDown = false;
    if(e instanceof MouseEvent){
        let x=e.offsetX,y=e.offsetY;
        mouseMoveWithBrush(x, y)
    }else{
        let x=e.touches[0].offsetX,y=e.touches[0].offsetY;
        mouseMoveWithBrush(x, y)
    }
};

const mouseDown = (e)=>{
    isMouseDown = true;
    if(e instanceof MouseEvent){
        let x=e.offsetX,y=e.offsetY;
        checkForIsFalse(x, y);
        mouseMoveWithBrush(x, y)
    }else{
        let x=e.touches[0].offsetX,y=e.touches[0].offsetY;
        checkForIsFalse(x, y);
        mouseMoveWithBrush(x, y)
    }
};

const mapValues = (value, start1, stop1, start2, stop2)=>{
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}


var imageUploaded = false;
var currentImageEditing = null;
var originalImage = null;
var maskImage = null;
let BRUSH_SIZE = 1;
let imageWidth = 0;
let imageHeight = 0;

let isMouseDown = false;
let wasAtStartFalse = true;

var MASK_DATA = [];
const RECTS_WIDTH_PX = 10;
const RECTS_HEIGHT_PX = 10;
let isMouseDownUploadedImage = false;

let mask = null;
let ctx = null;
let uploadElement = null;

document.addEventListener('documentLoaded', function() {

    mask = document.getElementById("mask");
    ctx = mask.getContext("2d");
    uploadElement = document.createElement("input");
    uploadElement.type = "file";


    document.addEventListener("modelChange", function(e){
        if(e.detail == "dall-e-2"){
            uploadElement.accept = "image/png";
        }else{
            uploadElement.accept = "image/png, image/jpg, image/jpeg, image/jpg";
        }
    });

    uploadElement.style.display = "none";
    uploadElement.onchange = function(e){
        let file = e.target.files[0];
        if(file){
            if(file.size > 4 * 1000 * 1000){
                alert(lang.get("messages.error.fileToBig4MB"), AlertType.ERROR, 3000);
                return;
            }
            let reader = new FileReader();
            reader.onload = function(e){
                let data = e.target.result;
                convertJpgToPng(data, (data)=>{
                    currentImageEditing = data;
                    originalImage = data;
                    document.getElementById("sourceImage").src = data;
                    
                    let tmpImage = new Image();
                    tmpImage.src = data;
                    
                    let width = window.screen.width/8*5;
                    let height = window.screen.width/8*5;

                    imageWidth = width;
                    imageHeight = height;

                    mask.width = imageWidth;
                    mask.height = imageHeight;

                    mask.style.width = width + "px";
                    mask.style.height = height + "px";


                    document.getElementById("sourceImage").width = width;
                    document.getElementById("sourceImage").height = width;

                    document.getElementById("sourceImage").style.width = width;
                    document.getElementById("sourceImage").style.height = width;


                    document.getElementById("imageEditorDialog").showModal();
                    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
                    ctx.fillRect(0, 0, mask.width, mask.height);
                    ctx.fill();
                    MASK_DATA = [];
                    isMouseDown = false;
                    wasAtStartFalse = true;
                    for(let i = 0; i < Math.ceil(mask.width/RECTS_WIDTH_PX); i++){
                        MASK_DATA[i] = [];
                        for(let j = 0; j < Math.ceil(mask.height/RECTS_HEIGHT_PX); j++){
                            MASK_DATA[i][j] = false;
                        }
                    }

                    if(getSizeOfImage(tmpImage) > 4 * 1000 * 1000){
                        alert(lang.get("messages.error.fileToBig4MB"), AlertType.ERROR, 3000);
                        return;
                    }

                    //update brush size
                    BRUSH_SIZE = document.getElementById("areaOfAffectSize").value;

                });
            }
            reader.readAsDataURL(file);
        }
    };
    document.body.appendChild(uploadElement);
    let uploadButton = document.getElementById("uploadImage");
    uploadButton.addEventListener("click", function(){
        let model = "";
        if(currentChat != null){
            model = currentChat.getModel();
        }else{
            model = getCurrentModel();
        }
        updateUpload(model);
        uploadElement.click();
    });

    document.addEventListener("modelChange", function(e){
        let model = e.detail;
        updateUpload(model);
    });


    $("#imageEditorDialog #cancel").on("click", (e)=>{
        document.getElementById("imageEditorDialog").close();
    });


    document.getElementById("uploadedImage").ontouchstart = ()=>{isMouseDownUploadedImage = true;};
    document.getElementById("uploadedImage").ontouchend = ()=>{isMouseDownUploadedImage = false;};
    document.getElementById("uploadedImage").ontouchmove = onUploadedImageDrag;

    document.getElementById("uploadedImage").onmousedown = ()=>{isMouseDownUploadedImage = true;};
    document.getElementById("uploadedImage").onmouseup = ()=>{isMouseDownUploadedImage = false;};

    document.getElementById("uploadedImage").onmousemove = (e)=>{
        if(isMouseDownUploadedImage){
            onUploadedImageDrag(e);
        }
    };

});

function onUploadedImageDrag(e){
    e.preventDefault();
    let deleteImage = confirm(lang.get("confirm.doYouWantToDeleteImage"));
    if(deleteImage){
        clearCurrentImage();
    }
}

function disableCanvas(){
    document.getElementById("uploadedImage").style.cursor = "default";

    mask.removeEventListener("mouseup", mouseUp);
    mask.removeEventListener("mousedown", mouseDown);
    mask.removeEventListener("mousemove", mouseMove);
    mask.removeEventListener("touchstart", mouseDown);
    mask.removeEventListener("touchend", mouseUp);
    mask.removeEventListener("touchmove", mouseMove);

    $("#imageEditorDialog #ok").off("click");
    $("#promptBar #uploadedImage").off("click");
    mask.style.display = "none";

    document.getElementById("settings").style.display = "none";


    $("#imageEditorDialog #ok").on("click", (e)=>{
        document.getElementById("imageEditorDialog").close();
        document.getElementById("uploadedImage").src = currentImageEditing;
        document.getElementById("promptBar").setAttribute("uploaded", "");
        currentImageEditing = originalImage;
    });

}

function enableCanvas(){

    document.getElementById("uploadedImage").style.cursor = "pointer";

    mask.addEventListener("mouseup", mouseUp);
    mask.addEventListener("mousedown", mouseDown);
    mask.addEventListener("mousemove", mouseMove);
    mask.addEventListener("touchstart", mouseDown);
    mask.addEventListener("touchend", mouseUp);
    mask.addEventListener("touchmove", mouseMove);

    mask.style.display = "block";
    document.getElementById("settings").style.display = "flex";

    $("#imageEditorDialog #ok").on("click", (e)=>{
        getDimensionOfImage(currentImageEditing, (size)=>{
            let canvas = document.createElement("canvas");
            let actualImageCanvas = document.createElement("canvas");
            let tmpCanvas = document.createElement("canvas");
            let imageCanvas = document.createElement("canvas");

            let sourceImage = new Image();
            sourceImage.src = currentImageEditing;
            sourceImage.onload = ()=>{

                let bigg = size.width > size.height ? size.width : size.height;

                actualImageCanvas.width = bigg;
                actualImageCanvas.height = bigg;
                canvas.width = bigg;
                canvas.height = bigg;
                tmpCanvas.width = bigg;
                tmpCanvas.height = bigg;
                imageCanvas.width = bigg;
                imageCanvas.height = bigg;


                let actualImageCtx = actualImageCanvas.getContext("2d");
                let ctx = canvas.getContext("2d");
                let tmpCtx = tmpCanvas.getContext("2d");
                let imageCtx = imageCanvas.getContext("2d");




                actualImageCtx.drawImage(sourceImage, 0, 0);

                //center image
                let xc = (bigg - size.width) / 2;
                let yc = (bigg - size.height) / 2;
                imageCtx.drawImage(sourceImage, xc, yc);
                ctx.drawImage(sourceImage, xc, yc);
                tmpCtx.strokeStyle = "rgba(0, 0, 0, 0.7)";
                tmpCtx.fillStyle = "rgba(0, 0, 0, 0.7)";
                tmpCtx.fillRect(0, 0, bigg, bigg);
                tmpCtx.fill();
                let TILE_WIDTH = Math.ceil(bigg/MASK_DATA.length);
                let TILE_HEIGHT = Math.ceil(bigg/MASK_DATA[0].length);
                
                for(let i = 0; i < MASK_DATA.length; i++){
                    for(let j = 0; j < MASK_DATA[i].length; j++){
                        if(MASK_DATA[i][j]){

                            ctx.clearRect(
                                i*TILE_WIDTH, 
                                j*TILE_HEIGHT, 
                                TILE_WIDTH, 
                                TILE_WIDTH
                            );
                            
                            tmpCtx.clearRect(
                                i*TILE_WIDTH, 
                                j*TILE_HEIGHT,
                                TILE_WIDTH, 
                                TILE_WIDTH
                            );

                            imageCtx.clearRect(
                                i*TILE_WIDTH, 
                                j*TILE_HEIGHT,
                                TILE_WIDTH, 
                                TILE_WIDTH
                            );
                        }
                    }
                }

                actualImageCtx.drawImage(tmpCanvas, 0, 0);

                let data = canvas.toDataURL("image/png");
                maskImage = data.replace(/data:image\/(jpg|png|jpeg);base64,/gi, "");
                let imgData = imageCanvas.toDataURL("image/jpeg");
                currentImageEditing = imgData;
                document.getElementById("imageEditorDialog").close();
                document.getElementById("uploadedImage").src = actualImageCanvas.toDataURL("image/jpeg");
                document.getElementById("promptBar").setAttribute("uploaded", "");
            };
        });
    });
    
    $("#promptBar #uploadedImage").on("click", (e)=>{
        document.getElementById("imageEditorDialog").showModal();
    });
}


function enableUploadButton(){
    document.getElementById("promptBar").setAttribute("uploadable", "");
}

function disableUploadButton(){
    document.getElementById("promptBar").removeAttribute("uploadable");
}

function clearCurrentImage(){
    sourceImage.src = "";
    imageUploaded = null;
    currentImageEditing = null;
    originalImage = null;
    maskImage = null;
    imageWidth = 0;
    imageHeight = 0;
    document.getElementById("promptBar").removeAttribute("uploaded");
    disableCanvas();
    enableCanvas();
}