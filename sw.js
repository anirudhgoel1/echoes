// Echoes service worker.
// Strict passthrough fetch + push handlers wired to the central
// f1.anirudhgoel.xyz gateway via the shared VAPID keypair.

const VERSION = 'echoes-sw-v1-2026-05-16';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; }
  catch { data = { title: 'Echoes', body: event.data ? event.data.text() : '' }; }
  const title = data.title || 'Echoes';
  const body  = data.body  || 'A new song just landed in the room.';
  const url   = data.url   || '/';
  event.waitUntil(self.registration.showNotification(title, {
    body,
    icon: data.icon,
    badge: data.badge,
    data: { url },
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(self.clients.matchAll({ type: 'window' }).then(all => {
    for (const c of all) {
      if (c.url.includes(self.location.origin)) { c.focus(); c.navigate(url); return; }
    }
    return self.clients.openWindow(url);
  }));
});

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request).catch(() => new Response('', { status: 504, statusText: 'offline' })));
});
