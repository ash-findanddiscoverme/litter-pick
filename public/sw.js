const CACHE_NAME = 'litterpick-v4';

// Install: activate immediately, no pre-caching needed since we don't
// serve same-origin content from cache (HTTP/2 handles that better)
self.addEventListener('install', () => {
  // #region agent log
  console.log('[SW-DBG-65d3e1] install event fired');
  // #endregion
  self.skipWaiting();
});

// Activate: clean old caches and take control of all tabs
self.addEventListener('activate', (event) => {
  // #region agent log
  console.log('[SW-DBG-65d3e1] activate event fired');
  // #endregion
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => {
          // #region agent log
          console.log('[SW-DBG-65d3e1] deleting old cache:', key);
          // #endregion
          return caches.delete(key);
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: only intercept third-party map tiles for caching.
// All same-origin requests pass straight through to the network
// so they benefit from HTTP/2 multiplexing via Cloudflare's CDN.
self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  try {
    const url = new URL(request.url);

    // Same-origin: don't intercept — let the browser handle directly
    if (url.origin === self.location.origin) return;

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
    }
  } catch (err) {
    // #region agent log
    console.error('[SW-DBG-65d3e1] fetch handler error:', err);
    // #endregion
  }
});
