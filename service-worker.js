const CACHE_NAME = "abbq-waste-v1";

const FILES = [

    "./",

    "./index.html",

    "./manifest.json",

    "./css/style.css",

    "./js/helper.js",

    "./js/database.js",

    "./js/ui.js",

    "./js/master.js",

    "./js/camera.js",

    "./js/input.js",

    "./js/history.js",

    "./js/dashboard.js",

    "./js/export.js",

    "./js/app.js"

];

self.addEventListener("install",event=>{

    event.waitUntil(

        caches.open(CACHE_NAME)

        .then(cache=>cache.addAll(FILES))

    );

});

self.addEventListener("fetch",event=>{

    event.respondWith(

        caches.match(event.request)

        .then(res=>res||fetch(event.request))

    );

});