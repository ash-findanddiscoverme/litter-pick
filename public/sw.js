const CACHE_NAME = 'litterpick-v2';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
];

// Install: cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: network-first for API, cache-first for static
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // API requests: network only
  if (url.pathname.startsWith('/api/')) return;

  // Map tiles: cache with network fallback
  if (url.hostname.includes('maptiler') || url.hostname.includes('tiles')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((response) => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          });
        })
      )
    );
    return;
  }

  // All other requests: network first with 3s timeout, fall back to cache
  event.respondWith(
    new Promise((resolve) => {
      let settled = false;
      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        caches.match(request).then((cached) => {
          resolve(cached || new Response('', { status: 504, statusText: 'Gateway Timeout' }));
        });
      }, 3000);

      fetch(request)
        .then((response) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          resolve(response);
        })
        .catch(() => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          caches.match(request).then((cached) => resolve(cached || new Response('Offline', { status: 503 })));
        });
    })
  );
});
