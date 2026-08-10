const CACHE_NAME = 'zoox-shell-v2';
const RUNTIME_CACHE = 'zoox-runtime-v2';
const APP_SHELL_URLS = [
  '/',
  '/live-sessions',
  '/reservations',
  '/feedback',
  '/customer-dashboard',
  '/sign-up-login-screen',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/favicon.ico',
];

const NAVIGATION_FALLBACK = '/';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME && key !== RUNTIME_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
      .then(() => {
        self.clients.matchAll().then((clients) => {
          clients.forEach((client) => client.postMessage({ type: 'ZOOX_SW_UPDATED' }));
        });
      })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'ZOOX_SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Skip cross-origin and API calls
  if (url.pathname.startsWith('/api/')) return;

  // Navigation requests: network-first with offline shell fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(NAVIGATION_FALLBACK).then((c) => c || caches.match('/')))
    );
    return;
  }

  // Hashed build assets (_next/static/*) and same-origin assets: stale-while-revalidate
  event.respondWith(
    caches.open(RUNTIME_CACHE).then((cache) =>
      cache.match(request).then((cached) => {
        const network = fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              const copy = response.clone();
              cache.put(request, copy);
            }
            return response;
          })
          .catch(() => cached);
        return cached || network;
      })
    )
  );
});
