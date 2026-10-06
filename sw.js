/* Study Hub — minimal offline shell. Caches each page as it's visited (not a full
   pre-cache), so revisiting a page works offline without a slow first install.
   Bump CACHE when shipping a breaking change to force old entries out. */
const CACHE = 'study-hub-v1';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return; // never cache cross-origin (YouTube thumbs, oEmbed, etc.)

  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      try {
        const fresh = await fetch(e.request);
        if (fresh && fresh.ok) cache.put(e.request, fresh.clone());
        return fresh;
      } catch (err) {
        const cached = await cache.match(e.request);
        if (cached) return cached;
        throw err;
      }
    })
  );
});
