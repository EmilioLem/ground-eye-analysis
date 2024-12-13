const CACHE_NAME = 'pwa-cache-v1';
const urlsToCache = [
    './index.html',

    './styles/main.css',

    './script/main.js',
    './script/colorLogic.js',
    //'./script/tableLogic.js',

    './manifest.json',
    './service-worker.js',
    './moreResources/chroma-min.js',

    './munsellDatabaseCreation/colorData.js',

    './images/icon-192x192.png',
    './images/icon-512x512.png',
    './images/favicon.ico',
    './images/enes-juriquilla-unam-logos-header.png',
    './images/enes-juriquilla-unam-logos-header-positivo.png',
    './images/image.png'

];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

/*self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});*/
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request) // Always fetch from the network
            .catch(() => caches.match(event.request)) // If network fails, fall back to cache
    );
});

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
