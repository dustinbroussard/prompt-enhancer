// Progressive Web App service worker with Stale-While-Revalidate
const SHELL_CACHE = 'pe-shell-v2';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './sw.js',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    try { await cache.addAll(CORE_ASSETS); } catch {}
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== SHELL_CACHE).map(k => caches.delete(k)));
    self.clients.claim();
  })());
});

const staleWhileRevalidate = async (request) => {
  const cache = await caches.open(SHELL_CACHE);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request)
    .then((res) => {
      cache.put(request, res.clone());
      return res;
    })
    .catch(() => undefined);
  return cached || fetchPromise || fetch(request);
};

const networkFirst = async (request) => {
  try {
    const fresh = await fetch(request);
    const cache = await caches.open(SHELL_CACHE);
    cache.put(request, fresh.clone());
    return fresh;
  } catch {
    const cache = await caches.open(SHELL_CACHE);
    const fallback = await cache.match('./') || await cache.match('/index.html');
    return fallback || new Response('<h1>Offline</h1>', { headers: { 'Content-Type': 'text/html' } });
  }
};

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET') return;
  if (url.origin !== location.origin) return;

  if (req.mode === 'navigate') {
    event.respondWith(networkFirst(req));
    return;
  }

  event.respondWith(staleWhileRevalidate(req));
});
