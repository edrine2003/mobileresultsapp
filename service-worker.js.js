const CACHE_NAME = 'mlmityana-v1';
const OFFLINE_URL = '/labresultsmityana/index.html';

const PRECACHE_URLS = [
  '/labresultsmityana/',
  '/labresultsmityana/index.html',
  '/labresultsmityana/manifest.json',
  // Add important assets you want cached on first load:
  '/labresultsmityana/styles.css', // if you later extract styles
  '/labresultsmityana/icons/icon-192.png',
  '/labresultsmityana/icons/icon-512.png'
];

// Install - cache core resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate - cleanup old caches if any
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k !== CACHE_NAME) ? caches.delete(k) : null))
    ).then(() => self.clients.claim())
  );
});

// Fetch - try cache first, then network, fallback to offline page
self.addEventListener('fetch', event => {
  const req = event.request;
  // Only handle GET requests
  if (req.method !== 'GET') return;

  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(networkResponse => {
        // Optionally cache same-origin responses for future
        if (networkResponse && networkResponse.status === 200 && req.url.startsWith(self.location.origin)) {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        }
        return networkResponse;
      }).catch(() => {
        // If request is for a navigation (HTML), return offline fallback
        if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
          return caches.match(OFFLINE_URL);
        }
      });
    })
  );
});
