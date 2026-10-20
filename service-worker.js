const CACHE_NAME = 'workout-tracker-orange-v2';
const urlsToCache = [
  './', './index.html', './styles.css', './redesign.css', './script.js',
  './redesign.js', './manifest.json', './icon-192.png', './icon-512.png',
  './progression.html', './popular.html', './toning.html'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' ||
      new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(event.request).then(response => {
      if (response.ok) {
        const copy = response.clone();
        event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)));
      }
      return response;
    }).catch(() => caches.match(event.request))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(names =>
    Promise.all(names.filter(name => name.startsWith('workout-tracker-') && name !== CACHE_NAME)
      .map(name => caches.delete(name)))
  ).then(() => self.clients.claim()));
});
