const CACHE_NAME = 'yerson-perez-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Instalación: Guarda todo en caché inmediatamente
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Cacheando archivos esenciales...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activación: Borra cachés viejas si actualizas la app
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('Borrando caché vieja:', key);
          return caches.delete(key);
        }
      }));
    })
  );
});

// Fetch: Intercepta las peticiones. Si hay internet, actualiza; si no, usa la caché.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Si está en caché, devuélvelo
      if (response) {
        return response;
      }
      // Si no, ve a internet y guarda una copia para la próxima
      return fetch(event.request).then((networkResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      });
    }).catch(() => {
      // Si falla todo (sin internet y no está en caché), muestra algo básico
      return new Response('Sin conexión');
    })
  );
});