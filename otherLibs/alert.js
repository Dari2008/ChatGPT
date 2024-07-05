AlertType = {"WARNING":"WARNING", "INFO":"INFO", "ERROR":"ERROR", "SUCCESS":"SUCCESS"};
var wasClosed = true;
alert = function(text, type, displayTime=2000,  animationTime=120){
    if(document.getElementById("alertMainDiv"))document.getElementById("alertMainDiv").setAttribute("type", type);
    if(document.getElementById("alertTextField"))document.getElementById("alertTextField").innerHTML = text;
    if(document.getElementById("alertMainDiv"))document.getElementById("alertMainDiv").style.display = null;
    if(document.getElementById("alertMainDiv"))document.getElementById("alertMainDiv").setAttribute("openAlert", "");
    if(document.getElementById("alertMainDiv"))document.getElementById("alertMainDiv").style.setProperty("--time", animationTime + "ms");
    wasClosed = false;
    setTimeout(()=>{
        if(document.getElementById("alertMainDiv").hasAttribute("closeAlert"))return;
        if(wasClosed)return;
        if(document.getElementById("alertMainDiv"))document.getElementById("alertMainDiv").setAttribute("closeAlert", "");
    }, displayTime);

};

document.addEventListener("documentLoaded", ()=>{
    let body = document.body;
    let styleSheet = document.createElement("style");
    styleSheet.textContent = `
        #alertMainDiv button[buttonIconType=CROSS] {
            color: white;
            border: none;
            top: 8px !important;
            right: 8px !important;
            transform: rotateZ(45deg) !important;
            font-size: 30px !important;
            background-color: rgba(0, 0, 0, 0) !important;
            color: white !important;
        }
        
        #alertMainDiv button[buttonIconType=CROSS]:hover {
            background-color: rgba(0, 0, 0, 0) !important;
        }
        
        #alertMainDiv button[buttonIconType=CROSS]:active {
            background-color: rgba(0, 0, 0, 0) !important;
        }
        
        #alertMainDiv option,
        #alertMainDiv select {
            color: white;
            border: none;
            height: 40px;
            outline: none;
        }
        
        #alertMainDiv input {
            color: white;
            border: none;
            outline: none;
            font-size: 16px;
            border-radius: 10px;
        }
        
        #alertMainDiv h1,
        #alertMainDiv h2,
        #alertMainDiv h3,
        #alertMainDiv h4,
        #alertMainDiv h5,
        #alertMainDiv h6,
        #alertMainDiv span,
        #alertMainDiv p,
        #alertMainDiv label {
            -webkit-user-select: none;
            -moz-user-select: none;
            user-select: none;
        }
        
        #alertMainDiv ::-webkit-scrollbar {
            width: 10px;
            border-radius: 5px;
        }
        
        #alertMainDiv ::-webkit-scrollbar-track:hover {
            width: 10px;
            border-radius: 5px;
        }
        
        #alertMainDiv ::-webkit-scrollbar-thumb {
            width: 10px;
            border-radius: 5px;
        }
        
        #alertMainDiv :not(:hover)::-webkit-scrollbar {
            display: none;
        }
        
        #alertMainDiv {
            width: auto;
            height: auto;
            min-width: 200px;
            min-height: 50px;
            max-width: 700px;
            max-height: 96%;
            position: fixed;
            top: 0px;
            left: 50%;
            transform: translateX(-50%);
            padding: 20px;
            border-bottom-right-radius: 10px;
            border-bottom-left-radius: 10px;
            z-index: 9999999999;
        }
        
        #alertMainDiv[closeAlert] {
            --time: 200ms;
            display: block !important;
            animation: closeAlert var(--time) ease-in 0ms 1;
        }
        
        #alertMainDiv[openAlert] {
            --time: 200ms;
            display: block !important;
            animation: openAlert var(--time) ease-in 0ms 1;
        }
        
        #closeMessage {
            position: sticky;
            float: right;
            z-index: 10000000000;
            font-size: 20px;
            background-color: rgba(0, 0, 0, 0);
            transform: rotate(45deg);
        }
        
        #alertTextField {
            font-size: 15px;
            padding: 20px;
        }
        
        @keyframes closeAlert {
            0% {
                transform: translateY(0%) translateX(-50%);
            }
        
            100% {
                transform: translateY(-100%) translateX(-50%);
            }
        }
        
        @keyframes openAlert {
            0% {
                transform: translateY(-100%) translateX(-50%);
            }
        
            100% {
                transform: translateY(0%) translateX(-50%);
            }
        }
        
        .dark{
            #alertMainDiv button[buttonIconType=CROSS] {
                background-color: rgb(44, 49, 53);
                color: white !important;
            }
        
            #alertMainDiv button[buttonIconType=CROSS]:hover {
                color: rgb(82, 90, 95) !important;
            }
        
            #alertMainDiv button[buttonIconType=CROSS]:active {
                color: rgb(30, 34, 37) !important;
            }
        
            #alertMainDiv button[selected] {
                background-color: rgb(21, 23, 25);
            }
        
            #alertMainDiv button:not([disabled]):hover {
                background-color: rgb(62, 70, 75);
            }
        
            #alertMainDiv button:not([disabled]):active {
                background-color: rgb(30, 34, 37);
            }
        
            #alertMainDiv option,
            #alertMainDiv select {
                background-color: rgb(44, 49, 53);
            }
        
            #alertMainDiv input {
                background-color: rgb(44, 49, 53);
            }
        
            #alertMainDiv ::-webkit-scrollbar-track:hover {
                background-color: rgb(50, 50, 50);
            }
        
            #alertMainDiv ::-webkit-scrollbar-thumb {
                background-color: rgb(120, 120, 120);
            }
        
            #alertMainDiv[type=SUCCESS] {
                background-color: color-mix(in srgb, rgb(64, 69, 73) 75%, rgb(0, 255, 0) 25%);
            }
        
            #alertMainDiv[type=ERROR] {
                background-color: color-mix(in srgb, rgb(64, 69, 73) 75%, rgb(255, 0, 0) 25%);
            }
        
            #alertMainDiv[type=INFO] {
                background-color: color-mix(in srgb, rgb(64, 69, 73) 75%, rgb(43, 195, 255) 25%);
            }
        
            #alertMainDiv[type=WARNING] {
                background-color: color-mix(in srgb, rgb(64, 69, 73) 75%, rgb(255, 255, 0) 25%);
            }
        
            #alertMainDiv #closeMessage {
                color: white;
            }
        
            #alertMainDiv #closeMessage:hover {
                color: rgb(82, 90, 95);
            }
        
            #alertMainDiv #closeMessage:active {
                color: rgb(30, 34, 37);
            }
        
        }
        
        .light {
            button[buttonIconType=CROSS] {
                background-color: rgb(194, 199, 203);
                color: black !important;
            }
        
            button[buttonIconType=CROSS]:hover {
                color: rgb(232, 240, 235) !important;
            }
        
            button[buttonIconType=CROSS]:active {
                color: rgb(180, 184, 187) !important;
            }
        
            button[selected] {
                background-color: rgb(171, 173, 175);
            }
        
            button:not([disabled]):hover {
                background-color: rgb(212, 220, 225);
            }
        
            button:not([disabled]):active {
                background-color: rgb(180, 184, 187);
            }
        
            option,
            select {
                background-color: rgb(194, 199, 203);
            }
        
            input {
                background-color: rgb(194, 199, 203);
            }
        
            ::-webkit-scrollbar-track:hover {
                background-color: rgb(100, 100, 100);
            }
        
            ::-webkit-scrollbar-thumb {
                background-color: rgb(120, 120, 120);
            }
        
            #alertMainDiv[type=SUCCESS] {
                background-color: color-mix(in srgb, rgb(64, 69, 73) 20%, rgb(0, 255, 0) 80%);
            }
        
            #alertMainDiv[type=ERROR] {
                background-color: color-mix(in srgb, rgb(64, 69, 73) 20%, rgb(255, 0, 0) 80%);
            }
        
            #alertMainDiv[type=INFO] {
                background-color: color-mix(in srgb, rgb(64, 69, 73) 20%, rgb(43, 195, 255) 80%);
            }
        
            #alertMainDiv[type=WARNING] {
                background-color: color-mix(in srgb, rgb(64, 69, 73) 20%, rgb(255, 255, 0) 80%);
            }
        
            #closeMessage {
                color: black;
            }
        
            #closeMessage:hover {
                color: rgb(132, 140, 145);
            }
        
            #closeMessage:active {
                color: rgb(180, 184, 187);
            }
        }
    `;
    document.head.appendChild(styleSheet);

    createAlertDiv(body);

    if(document.getElementById("alertMainDiv"))document.getElementById("alertMainDiv").addEventListener("animationend", function(e){
        if(e.animationName == "closeAlert"){
            wasClosed = true;
            document.getElementById("alertMainDiv").style.display = "none";
        }else if(e.animationName == "openAlert"){
            document.getElementById("alertMainDiv").style.display = null;
        }
        document.getElementById("alertMainDiv").removeAttribute("openAlert");
        document.getElementById("alertMainDiv").removeAttribute("closeAlert");
    });
});

function createAlertDiv(body){
    let alertMainDiv = document.createElement("div");
    let closeMessage = document.createElement("button");
    let alertTextField = document.createElement("p");

    alertMainDiv.id = "alertMainDiv";
    closeMessage.id = "closeMessage";
    alertTextField.id = "alertTextField";

    closeMessage.textContent = "✛";
    closeMessage.onclick = ()=>alertMainDiv.setAttribute('closeAlert', '');

    alertMainDiv.appendChild(closeMessage);
    alertMainDiv.appendChild(alertTextField);

    alertMainDiv.style.display = "none";

    body.appendChild(alertMainDiv);
}