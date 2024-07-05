const offlinePages = [
    "alert.js", 
    "Chat.js", 
    "ChatStorage.js", 
    "customDropDown.js", 
    "downloadPdf.js", 
    "editProtection.js", 
    "gapi.js", 
    "highlight.min.js", 
    "ImageStorage.js", 
    "jquery.min.js", 
    "main.js", 
    "Message.js", 
    "MessageHistory.js", 
    "offlineServiceWorker.js", 
    "OpenAI.js", 
    "payment.js", 
    "priceCalculation.js", 
    "replaceLast.js", 
    "test.js", 
    "usage.js", 
    "usageChart.js", 
    "index.html", 
    "login.html", 
    "test.html", 
    "chatGptStyle.css", 
    "Fonts.css", 
    "login.css", 
    "main.css", 
    "payment.css", 
    "responsive.css", 
    "usage.css", 
    "Variables.css", 
    "fpdf.css", 
    "favicon.jpg", 
    "favicon_120_120.jpg", 
    "logout.png", 
    "logo.png", 
    "delete.svg", 
    "logout.svg", 
    "payIn.svg", 
    "usage.svg", 
    "favicon.ico"
];

const cacheName = 'offline-cache';

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(cacheName)
            .then((cache) => {
                return cache.addAll(offlinePages);
            })
    );
});

self.addEventListener('fetch', (event) => {
    if(event.request.method !== 'GET') return;
    if(event.request.url.includes("isOffline.js")){
        event.respondWith(
            new Response("var isOffline = true;", {
                headers: {
                    "Content-Type": "application/javascript"
                }
            })
        );
    }else{
        event.respondWith(
            caches.match(event.request)
                .then((response) => {
                    if (response) {
                        return response;
                    }

                    return fetch(event.request)
                        .then((response) => {
                            return caches.open(cacheName)
                                .then((cache) => {
                                    cache.put(event.request, response.clone());
                                    return response;
                                });
                        });
                })
        );
    }
});