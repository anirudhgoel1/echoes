// Echoes service worker · NO fetch handler · push-only.
//
// v2 (2026-05-18): removed the buggy fetch handler that intercepted
// every request and returned 504 on any failure — including transient
// cross-origin album-cover fetches from is1-ssl.mzstatic.com. The
// .catch swallowed real errors and presented them as 504s, which made
// album covers fail to render even when the upstream CDN was healthy.
//
// The new SW only handles push notifications. The browser handles
// every other request natively (faster, safer, no spurious 504s).

const VERSION = 'echoes-sw-v2-2026-05-18-no-fetch-trap';

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    // Evict any caches v1 may have created (it didn't, but defensive)
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
  })());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    await self.clients.claim();
    // Force-reload every controlled tab so the user immediately sees
    // the healed page (album covers loading) rather than waiting for
    // a manual refresh.
    const tabs = await self.clients.matchAll({ type: 'window' });
    for (const tab of tabs) {
      try { tab.navigate(tab.url); } catch { /* cross-origin / detached */ }
    }
  })());
});

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
  event.waitUntil(self.clients.matchAll({ type: 'window' }).then((all) => {
    for (const c of all) {
      if (c.url.includes(self.location.origin)) { c.focus(); c.navigate(url); return; }
    }
    return self.clients.openWindow(url);
  }));
});

// NO fetch handler. See file header for why.
