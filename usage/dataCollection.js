document.addEventListener("modelChange", (e)=>{

    let model = e.detail;

    gtag("model", model);
    
});