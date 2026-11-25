/* Respiro — service worker: l'app si apre anche senza internet.
   Quando aggiorni index.html, cambia VERSION (es. v2) così l'iPhone scarica la nuova versione. */
const VERSION = 'respiro-v7';
const ASSETS = ['./', './index.html', './manifest.json', './icon-180.png', './icon-512.png', './splash-1179x2556.png', './splash-dark-1179x2556.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Apertura istantanea dalla cache; in sottofondo controlla se c'è una versione nuova */
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const key = req.mode === 'navigate' ? './index.html' : req;
  e.respondWith(
    caches.open(VERSION).then(async cache => {
      const cached = await cache.match(key, { ignoreSearch: true });
      const network = fetch(req)
        .then(res => { if (res && res.ok) cache.put(key, res.clone()); return res; })
        .catch(() => cached);
      return cached || network;
    })
  );
});
