const CACHE_NAME = 'litterpick-v3';
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

// Fetch: only intercept resources that benefit from SW caching.
// Let navigations, static assets (JS/CSS/fonts), and API calls go straight
// to the network so they use HTTP/2 multiplexing from Cloudflare's CDN.
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests from our own origin or map tile CDNs
  if (request.method !== 'GET') return;
  if (url.origin === self.location.origin) {
    // Don't intercept same-origin requests — let HTTP/2 handle them directly.
    // This includes navigations, JS chunks, CSS, fonts, images, and API calls.
    return;
  }

  // Map tiles: cache with network fallback (third-party CDN, benefits from caching)
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
});
