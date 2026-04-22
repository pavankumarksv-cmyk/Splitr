const CACHE = 'splitr-v2';
const ASSETS = [
  './',
  './splitr.html',
  './manifest.json',
  './style.css',
  './script.js',
  './icon-192.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (!res || res.status !== 200) return res;
        const clone = res.clone();
        if (e.request.url.startsWith(self.location.origin)) {
  caches.open(CACHE).then(c => c.put(e.request, clone));
}
        return res;
      }).catch(() => caches.match('./splitr.html'));
    })
  );
});

// Push notifications support
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : { title: 'Splitr', body: 'You have a pending balance!' };
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: './icon-192.png',
      badge: './icon-192.png',
      vibrate: [100, 50, 100],
      data: { url: './' }
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data.url || './'));
});
