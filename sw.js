// Service worker: guarda la app en el celular para que abra al instante
// incluso con poca señal. El envío de datos igual necesita internet.
const CACHE = 'recepcion-mitre-v1';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return; // los envíos al script van directo
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
