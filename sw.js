// Service worker: guarda la app en el celular para que abra al instante
// incluso con poca señal. El envío de datos igual necesita internet.
//
// Estrategia NETWORK-FIRST: siempre intenta traer lo último de internet.
// Si hay señal -> agarra la versión nueva que subiste a GitHub/Netlify.
// Si NO hay señal -> usa la copia guardada y la app sigue andando offline.
// Así no hace falta borrar caché ni reinstalar cuando actualizás.
//
// IMPORTANTE: cada vez que subas una versión nueva NO necesitás tocar nada,
// pero si algún día querés forzar un limpiado total, subí el número de abajo.
const CACHE = 'recepcion-mitre-v2';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

// Al instalar: guarda una copia base para que funcione offline la primera vez
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())
  );
});

// Al activar: borra las versiones viejas del caché
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Al pedir un archivo: primero internet, y si falla, la copia guardada
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return; // los envíos al script van directo

  e.respondWith(
    fetch(e.request)
      .then(resp => {
        // guarda una copia fresca para el próximo arranque sin señal
        const copia = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, copia)).catch(() => {});
        return resp;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
