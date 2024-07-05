async function downloadPDF(){
    let data = await (await fetch(DATAURL, {
        "headers": {
            "Content-Type": "application/pdf",
            "Access-Control-Allow-Credentials": true,
            "Auth": "Bearer " + OpenAI.INSTANCE.getAccessToken(),
        },
        "method": "POST",
        "mode": "cors",
        "body": JSON.stringify({
            "actionId": 3
        })
    })).blob();

    let url = window.URL.createObjectURL(data);
    let a = document.createElement('a');
    a.href = url;
    a.download = 'usageReport.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
}