

async function updateUsage(){
  let data = await (await fetch(DATAURL, {
    
    "headers": {
      "Content-Type": "application/json",
      "Access-Control-Allow-Credentials": true,
      "Auth": "Bearer " + OpenAI.INSTANCE.getAccessToken(),
    },
    "method": "POST",
    "mode": "cors",
    "body": JSON.stringify({
      "actionId": 2
    })
  })).json();

  if(data.ok === false){
    console.error(data.message);
    alert("An error occured while fetching the usage data\nFehler Code:" + codeOfString(data.message), AlertType.ERROR, 3000);
    return;
  }

  let used = data.usedCost.toFixed(1);
  let total = data.totalCost.toFixed(1);

  let percentage = (used / total) * 100;

  document.getElementById("usedCost").innerText = used;
  document.getElementById("maxCost").innerText = total;
  document.getElementById("left").innerText = "$" + (total - used).toFixed(1);

  let fullDiv = document.getElementById("progressbar");

  let modelCount = 10;
  let margin = 2;

  document.getElementById("progressbar").innerHTML = "";

  let dalle_v3_Div = document.createElement("div");
  let dalle_v2_Div = document.createElement("div");

  let gpt_4_0613 = document.createElement("div");
  let gpt_3v5_turbo_0125 = document.createElement("div");
  let gpt_3v5_turbo_16k_0613 = document.createElement("div");
  let gpt_3v5_turbo_0613 = document.createElement("div");
  let gpt_4_0125_preview = document.createElement("div");
  let gpt_4_1106_vision_preview = document.createElement("div");
  let gpt_4_1106_preview = document.createElement("div");
  let gpt_3v5_turbo_1106 = document.createElement("div");

  gpt_4_0613.classList.add("chatAI");
  gpt_3v5_turbo_0125.classList.add("chatAI");
  gpt_3v5_turbo_16k_0613.classList.add("chatAI");
  gpt_3v5_turbo_0613.classList.add("chatAI");
  gpt_4_0125_preview.classList.add("chatAI");
  gpt_4_1106_vision_preview.classList.add("chatAI");
  gpt_4_1106_preview.classList.add("chatAI");
  gpt_3v5_turbo_1106.classList.add("chatAI");

  dalle_v3_Div.classList.add("imageAI");
  dalle_v2_Div.classList.add("imageAI");


  gpt_4_0613.classList.add("ai");
  gpt_3v5_turbo_0125.classList.add("ai");
  gpt_3v5_turbo_16k_0613.classList.add("ai");
  gpt_3v5_turbo_0613.classList.add("ai");
  gpt_4_0125_preview.classList.add("ai");
  gpt_4_1106_vision_preview.classList.add("ai");
  gpt_4_1106_preview.classList.add("ai");
  gpt_3v5_turbo_1106.classList.add("ai");
  dalle_v3_Div.classList.add("ai");
  dalle_v2_Div.classList.add("ai");


  gpt_4_0613.setAttribute("model", "gpt-4-0613");
  gpt_3v5_turbo_0125.setAttribute("model", "gpt-3.5-turbo-0125");
  gpt_3v5_turbo_16k_0613.setAttribute("model", "gpt-3.5-turbo-16k-0613");
  gpt_3v5_turbo_0613.setAttribute("model", "gpt-3.5-turbo-0613");
  gpt_4_0125_preview.setAttribute("model", "gpt-4-0125-preview");
  gpt_4_1106_vision_preview.setAttribute("model", "gpt-4-1106-vision-preview");
  gpt_4_1106_preview.setAttribute("model", "gpt-4-1106-preview");
  gpt_3v5_turbo_1106.setAttribute("model", "gpt-3.5-turbo-1106");

  dalle_v3_Div.setAttribute("model", "dall-e-3");
  dalle_v2_Div.setAttribute("model", "dall-e-2");


  let totalRequests = data.usedCost;
  let dalle_3_Request = getPriceFor("dall-e-3", data).toFixed(4);
  let dalle_2_Request = getPriceFor("dall-e-2", data).toFixed(4);
  let gpt_4_0613_Request = getPriceFor("gpt-4-0613", data).toFixed(4);
  let gpt_3v5_turbo_0125_Request = getPriceFor("gpt-3.5-turbo-0125", data).toFixed(4);
  let gpt_3v5_turbo_16k_0613_Request = getPriceFor("gpt-3.5-turbo-16k-0613", data).toFixed(4);
  let gpt_3v5_turbo_0613_Request = getPriceFor("gpt-3.5-turbo-0613", data).toFixed(4);
  let gpt_4_0125_preview_Request = getPriceFor("gpt-4-0125-preview", data).toFixed(4);
  let gpt_4_1106_vision_preview_Request = getPriceFor("gpt-4-1106-vision-preview", data).toFixed(4);
  let gpt_4_1106_preview_Request = getPriceFor("gpt-4-1106-preview", data).toFixed(4);
  let gpt_3v5_turbo_1106_Request = getPriceFor("gpt-3.5-turbo-1106", data).toFixed(4);

  let modelsWithPrice = 0;

  if(dalle_3_Request != "?" && dalle_3_Request != 0)modelsWithPrice++;
  if(dalle_2_Request != "?" && dalle_2_Request != 0)modelsWithPrice++;
  if(gpt_4_0613_Request != "?" && gpt_4_0613_Request != 0)modelsWithPrice++;
  if(gpt_3v5_turbo_0125_Request != "?" && gpt_3v5_turbo_0125_Request != 0)modelsWithPrice++;
  if(gpt_3v5_turbo_16k_0613_Request != "?" && gpt_3v5_turbo_16k_0613_Request != 0)modelsWithPrice++;
  if(gpt_3v5_turbo_0613_Request != "?" && gpt_3v5_turbo_0613_Request != 0)modelsWithPrice++;
  if(gpt_4_0125_preview_Request != "?" && gpt_4_0125_preview_Request != 0)modelsWithPrice++;
  if(gpt_4_1106_vision_preview_Request != "?" && gpt_4_1106_vision_preview_Request != 0)modelsWithPrice++;
  if(gpt_4_1106_preview_Request != "?" && gpt_4_1106_preview_Request != 0)modelsWithPrice++;
  if(gpt_3v5_turbo_1106_Request != "?" && gpt_3v5_turbo_1106_Request != 0)modelsWithPrice++;

  $("#GPT-4-0613 .requestCount").text("$" + gpt_4_0613_Request);
  $("#GPT-3v5-turbo-0125 .requestCount").text("$" + gpt_3v5_turbo_0125_Request);
  $("#GPT-3v5-turbo-16k-0613 .requestCount").text("$" + gpt_3v5_turbo_16k_0613_Request);
  $("#GPT-3v5-turbo-0613 .requestCount").text("$" + gpt_3v5_turbo_0613_Request);
  $("#GPT-4-0125-preview .requestCount").text("$" + gpt_4_0125_preview_Request);
  $("#GPT-4-1106-vision-preview .requestCount").text("$" + gpt_4_1106_vision_preview_Request);
  $("#GPT-4-1106-preview .requestCount").text("$" + gpt_4_1106_preview_Request);
  $("#GPT-3v5-turbo-1106 .requestCount").text("$" + gpt_3v5_turbo_1106_Request);
  $("#DALL-E-3 .requestCount").text("$" + dalle_3_Request);
  $("#DALL-E-2 .requestCount").text("$" + dalle_2_Request);

  let totalWidth = $("#progressbar").width() - (modelsWithPrice*margin);

  let gpt_4_0613_width = (gpt_4_0613_Request / modelsWithPrice) * totalWidth;
  let gpt_3v5_turbo_0125_width = (gpt_3v5_turbo_0125_Request / modelsWithPrice) * totalWidth;
  let gpt_3v5_turbo_16k_0613_width = (gpt_3v5_turbo_16k_0613_Request / modelsWithPrice) * totalWidth;
  let gpt_3v5_turbo_0613_width = (gpt_3v5_turbo_0613_Request / modelsWithPrice) * totalWidth;
  let gpt_4_0125_preview_width = (gpt_4_0125_preview_Request / modelsWithPrice) * totalWidth;
  let gpt_4_1106_vision_preview_width = (gpt_4_1106_vision_preview_Request / modelsWithPrice) * totalWidth;
  let gpt_4_1106_preview_width = (gpt_4_1106_preview_Request / modelsWithPrice) * totalWidth;
  let gpt_3v5_turbo_1106_width = (gpt_3v5_turbo_1106_Request / modelsWithPrice) * totalWidth;

  let dalle_3_width = (dalle_3_Request / modelsWithPrice) * totalWidth;
  let dalle_2_width = (dalle_2_Request / modelsWithPrice) * totalWidth;


  dalle_v3_Div.style.width = dalle_3_width + "px";
  dalle_v2_Div.style.width = dalle_2_width + "px";
  gpt_4_0613.style.width = gpt_4_0613_width + "px";
  gpt_3v5_turbo_0125.style.width = gpt_3v5_turbo_0125_width + "px";
  gpt_3v5_turbo_16k_0613.style.width = gpt_3v5_turbo_16k_0613_width + "px";
  gpt_3v5_turbo_0613.style.width = gpt_3v5_turbo_0613_width + "px";
  gpt_4_0125_preview.style.width = gpt_4_0125_preview_width + "px";
  gpt_4_1106_vision_preview.style.width = gpt_4_1106_vision_preview_width + "px";
  gpt_4_1106_preview.style.width = gpt_4_1106_preview_width + "px";
  gpt_3v5_turbo_1106.style.width = gpt_3v5_turbo_1106_width + "px";


  //sort after width with chat and image Ai splited and add to first class first and to last class last

  fullDiv.innerHTML = "";

  let chatAI = [gpt_4_0613, gpt_3v5_turbo_0125, gpt_3v5_turbo_16k_0613, gpt_3v5_turbo_0613, gpt_4_0125_preview, gpt_4_1106_vision_preview, gpt_4_1106_preview, gpt_3v5_turbo_1106];
  let imageAI = [dalle_v3_Div, dalle_v2_Div];
  
  chatAI = chatAI.filter((e) => {
    return e.style.width != "0px";
  }).sort((a, b) => {
    return b.style.width.split("px")[0] - a.style.width.split("px")[0];
  });

  imageAI = imageAI.filter((e) => {
    return e.style.width != "0px";
  }).sort((a, b) => {
    return b.style.width.split("px")[0] - a.style.width.split("px")[0];
  });

  if(chatAI.length > 0)chatAI[0].classList.add("first");
  else if(imageAI.length > 0)imageAI[0].classList.add("first");
  if(imageAI.length > 0)imageAI[imageAI.length - 1].classList.add("last");
  else if(chatAI.length > 0)chatAI[chatAI.length - 1].classList.add("last");

  chatAI.forEach((element) => {
    fullDiv.appendChild(element);
  });

  imageAI.forEach((element) => {
    fullDiv.appendChild(element);
  });

  let hoverData = {
    "gpt-3.5-turbo-1106": "GPT-3v5-turbo-1106",
    "gpt-3.5-turbo-0613": "GPT-3v5-turbo-0613",
    "gpt-3.5-turbo-16k-0613": "GPT-3v5-turbo-16k-0613",
    "gpt-3.5-turbo-0125": "GPT-3v5-turbo-0125",
    "gpt-4-0613": "GPT-4-0613",
    "gpt-4-0125-preview": "GPT-4-0125-preview",
    "gpt-4-vision-preview": "GPT-4-vision-preview",
    "gpt-4-1106-preview": "GPT-4-1106-preview",
    "dall-e-3": "DALL-E-3",
    "dall-e-2": "DALL-E-2"
  };

  let aiDivs = $(".ai");
  aiDivs.each((index, element) => {
    let id = hoverData[element.getAttribute("model")];
    if(id == null || id == undefined)return;

    document.getElementById(id).addEventListener("mouseover", () => {
      if(id != "DALL-E-2" && id != "DALL-E-3"){
        element.classList.add("hoverBar");
      }else{
        element.classList.add("hoverBarDalle");
      }
    });
    document.getElementById(id).addEventListener("mouseout", () => {
      if(id != "DALL-E-2" && id != "DALL-E-3"){
        element.classList.remove("hoverBar");
      }else{
        element.classList.remove("hoverBarDalle");
      }
    });
    element.addEventListener("mouseover", () => {
      document.getElementById(id).classList.add("hoverLegend");
    });
    element.addEventListener("mouseout", () => {
      document.getElementById(id).classList.remove("hoverLegend");
    });
  });

  // Sort the legend after request count

  let legendsChatAi = $("#chatAiDivId .aiLegend");
  legendsChatAi = legendsChatAi.sort((a, b) => {
    let aCount = parseFloat(a.getElementsByClassName("requestCount")[0].innerText.replace("$", ""));
    let bCount = parseFloat(b.getElementsByClassName("requestCount")[0].innerText.replace("$", ""));
    return bCount - aCount;
  });

  legendsChatAi.each((index, element) => {
    document.getElementById("chatAiDivId").removeChild(element);
  });

  legendsChatAi.each((index, element) => {
    $("#chatAiDivId").append(element);
  });
  

  let legendsImageAi = $("#imageAIDivId .aiLegend");
  legendsImageAi.sort((a, b) => {
    let aCount = parseFloat(a.getElementsByClassName("requestCount")[0].innerText.replace("$", ""));
    let bCount = parseFloat(b.getElementsByClassName("requestCount")[0].innerText.replace("$", ""));
    return bCount - aCount;
  });

  legendsImageAi.each((index, e) => {
    document.getElementById("imageAIDivId").removeChild(e);
  });

  legendsImageAi.each((index, e) => {
    $("#imageAIDivId").append(e);
  });

  document.getElementById("legend").style.display = "block";


}

function getPriceFor(model, data){
  if(data != undefined){
    return data["models"][model];
  }
  return "?";
}


function showUsage(){
  updateUsage();
  document.getElementById('usageOverlay').showModal();
}