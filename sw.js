// Service Worker for Citadel Money Transfer PWA

const CACHE_NAME = 'citadel-money-transfer-v1';
const OFFLINE_URL = '/offline.html';

// List of files to cache during service worker installation
const PRECACHE_ASSETS = [
  'index.html',
  'offline.html',
  'manifest.json',
  'src/assets/logo.png',
  'src/assets/slide1.png',
  'src/assets/slide2.png',
  'src/assets/slide3.png',
  'src/static/css/styles.css',
  'src/static/js/calculator.js',
  'src/static/js/slideshow.js'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => self.clients.claim())
  );
});

// Fetch event - network first, then cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If the response is good, clone it and store it in the cache
        if (response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
        }
        return response;
      })
      .catch(() => {
        // If network fails, try to get it from the cache
        return caches.match(event.request)
          .then((response) => {
            // Return cached response if found
            if (response) {
              return response;
            }
            // If not found in cache and it's a navigation request, show offline page
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
            // Return empty response for other failed requests
            return new Response('', { status: 408, statusText: 'Network request failed' });
          });
      })
  );
});

// Listen for the 'message' event to handle cache clearing
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME)
      .then(() => {
        console.log('Cache cleared');
      });
  }
});