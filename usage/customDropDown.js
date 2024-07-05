let defaultInnerHtml = "<span>Select a model...</span>";
let currentSelected = null;
let currentSelectedDiv = document.createElement('div');


function createCustomDropDown(){
    let model = document.getElementById('model');

    let optionDiv = document.createElement('div');
    optionDiv.id = model.id;

    currentSelectedDiv.id = "currentSelectedDiv";
    currentSelectedDiv.innerHTML = defaultInnerHtml;

    currentSelectedDiv.onclick = function(){
        if(customDropDown.style.display == "block"){
            closeDropDown();
        }else{
            openDropDown();
        }
    }

    document.addEventListener('click', function(e){
        if(e.target.classList.contains("option") && e.target.hasAttribute("value"))return;
        if(isChildOfHtmlContent(currentSelectedDiv, e.target))return;
        if(isChildOfHtmlContent(customDropDown, e.target))return;
        if(isChildOfHtmlContent(model, e.target))return;
        closeDropDown();
    });

    let customDropDown = document.createElement('div');
    customDropDown.id = "customDropDown";

    optionDiv.appendChild(currentSelectedDiv);
    optionDiv.appendChild(customDropDown);

    let map = [];
    let nameIndexMap = {};
    let size = 0;


    for(let i = 0; i < model.options.length; i++){
        if(nameIndexMap[model.options[i].parentNode.label] === undefined){
            nameIndexMap[model.options[i].parentNode.label] = map.length;
            map.push({label: model.options[i].parentNode.label, options: []});
        }
        map[nameIndexMap[model.options[i].parentNode.label]].options.push(model.options[i]);
    }


    for(let optionGroup of map){

        let optGroup = document.createElement('div');
        optGroup.classList.add('optGroup');

        let label = document.createElement('span');
        label.classList.add('optGroupLabel');
        label.innerHTML = optionGroup.label;
        optGroup.appendChild(label);

        for(let j = 0; j < optionGroup.options.length; j++){
            let option = document.createElement('div');
            option.onclick = function(){
                currentSelected = option;
                removeAllSelected();
                option.setAttribute("selected", "");
                currentSelectedDiv.innerHTML = option.outerHTML;
                closeDropDown();
                document.dispatchEvent(new CustomEvent('modelChange', {detail: option.getAttribute("value")}));

            }
            option.classList.add('option');
            option.setAttribute("value", optionGroup.options[j].getAttribute("value"));
            let element = optionGroup.options[j];
            if(element.getAttribute("priceOverAll") == undefined){
                let priceInput = parseFloat(element.getAttribute("priceInput").split("/")[0]);
                let tokensInput = parseInt(element.getAttribute("priceInput").split("/")[1]);
                let tokensPerDollarInputK = (((1 / priceInput) * tokensInput)/1000).toFixed(1);
                let priceOutput = parseFloat(element.getAttribute("priceOutput").split("/")[0]);
                let tokensOutput = parseInt(element.getAttribute("priceOutput").split("/")[1]);
                let tokensPerDollarOutputK = (((1 / priceOutput) * tokensOutput)/1000).toFixed(1);

                let numFormatter = new Intl.NumberFormat('de-DE');

                option.innerHTML = "<span class='nameOfModel'>" + element.getAttribute("value") + "</span> \
                " + " <span class='tokens'>" + numFormatter.format(parseInt(element.getAttribute("tokens"))) + " tokens</span> \
                " + "<span class='priceInput'>1$ / " + numFormatter.format(tokensPerDollarInputK) + "K tokens</span> \
                " + "<span class='priceOutput'>1$ / " + numFormatter.format(tokensPerDollarOutputK) + "K tokens</span>\
                " + "<span class='priceOverAllSmallDevices'> ~ $" + element.getAttribute("overAllRoundAbout").replace("/", " / ") + " tokens</span>";
            }else{
                option.innerHTML = "<span class='nameOfModel'>" + element.getAttribute("value") + "</span>\
                " + "<span class='priceOverAll'> ~ " + element.getAttribute("priceOverAll") + " / image</span>";
            }
            optGroup.appendChild(option);
        }

        customDropDown.appendChild(optGroup);
    }

    document.addEventListener("modelChange", function(e){
        let model = e.detail;
        let promptBar = document.getElementById("promptArea");
        if(model.toLowerCase().includes("dall")){
            if(model.includes("-2")){
                promptBar.placeholder = "Create Images with DALL⋅E 2...";
            }else if(model.includes("-3")){
                promptBar.placeholder = "Create Images with DALL⋅E 3...";
            }else{
                promptBar.placeholder = "Create Images with DALL⋅E...";
            }
        }else{
            if(model.includes("-3.5")){
                promptBar.placeholder = "Chat with GPT-3.5..."; 
            }else if(model.includes("-4")){
                promptBar.placeholder = "Chat with GPT-4..."; 
            }else{
                promptBar.placeholder = "Chat with AI..."; 
            }
        }
    });

    let pricingOpenAi = document.createElement('a');
    pricingOpenAi.href = "https://openai.com/pricing";
    pricingOpenAi.target = "_blank";
    pricingOpenAi.innerHTML = "More info on OpenAI pricing";
    pricingOpenAi.id = "pricingOpenAi";
    customDropDown.appendChild(pricingOpenAi);


    model.parentElement.replaceChild(optionDiv, model);

    function closeDropDown(){
        customDropDown.style.display = "none";
        optionDiv.removeAttribute("open");
        currentSelectedDiv.innerHTML = currentSelected.outerHTML
        removeAllSelected();
        if(currentSelected != null)currentSelected.removeAttribute("selected");
    }

    function openDropDown(){
        customDropDown.style.display = "block";
        optionDiv.setAttribute("open", "");
        currentSelectedDiv.innerHTML = defaultInnerHtml;
        removeAllSelected();
        if(currentSelected != null)currentSelected.setAttribute("selected", "");
    }

    function removeAllSelected(){
        let options = document.getElementsByClassName('option');
        for(let option of options){
            option.removeAttribute("selected");
        }
    }

    function loadModelAsSelected(name){
        let options = document.getElementsByClassName('option');
        for(let option of options){
            if(option.getAttribute("value") == name){
                currentSelected = option;
                currentSelectedDiv.innerHTML = option.outerHTML;
                break;
            }
        }
    }

    loadModelAsSelected(OpenAI.DEFAULT_MODEL);
    document.dispatchEvent(new CustomEvent('modelChange', {detail: OpenAI.DEFAULT_MODEL}));
}

function getCurrentModel(){
    if(currentSelected == undefined)return OpenAI.DEFAULT_MODEL;
    if(currentSelected == null)return OpenAI.DEFAULT_MODEL;
    if(currentSelected.getAttribute("value") == null)return OpenAI.DEFAULT_MODEL;
    if(currentSelected.getAttribute("value") == "")return OpenAI.DEFAULT_MODEL;
    if(currentSelected.getAttribute("value") == undefined)return OpenAI.DEFAULT_MODEL;
    return currentSelected.getAttribute("value");
}