const CACHE_NAME = 'litterpick-v5';

// #region agent log
console.log('[SW v5] Script loaded at', new Date().toISOString());
// #endregion

// Install: activate immediately, no pre-caching needed since we don't
// serve same-origin content from cache (HTTP/2 handles that better)
self.addEventListener('install', (event) => {
  // #region agent log
  console.log('[SW v5] INSTALL event fired');
  // #endregion
  self.skipWaiting();
});

// Activate: clean old caches and take control of all tabs
self.addEventListener('activate', (event) => {
  // #region agent log
  console.log('[SW v5] ACTIVATE event fired');
  // #endregion
  event.waitUntil(
    caches.keys().then((keys) => {
      // #region agent log
      console.log('[SW v5] Found cache keys:', keys);
      // #endregion
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => {
          // #region agent log
          console.log('[SW v5] Deleting old cache:', key);
          // #endregion
          return caches.delete(key);
        })
      );
    }).then(() => {
      // #region agent log
      console.log('[SW v5] Calling clients.claim()');
      // #endregion
      return self.clients.claim();
    }).then(() => {
      // #region agent log
      console.log('[SW v5] clients.claim() complete');
      // #endregion
    })
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
      // #region agent log
      console.log('[SW v5] Caching map tile:', url.href.substring(0, 80));
      // #endregion
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
    console.error('[SW v5] Fetch error:', err);
    // #endregion
  }
});
