/* public/sw.js */

// helper: broadcast message ke semua client
async function broadcastToClients(msg) {
  const allClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
  for (const client of allClients) {
    // visibilityState tersedia di WindowClient modern (Chrome/Edge/Safari baru)
    try {
      client.postMessage({ type: 'PUSH_EVENT', payload: msg });
    } catch (_) {}
  }
}

self.addEventListener('push', event => {
  let data = {};
  try {
    if (event.data) data = event.data.json();
  } catch {
    data = { title: 'Notifikasi', body: event.data?.text?.() || '' };
  }

  const title = data.title || 'Notifikasi';
  const options = {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    data: { url: data.url || '/', ...data.data },
    requireInteraction: false,
  };

  event.waitUntil((async () => {
    // kirim ke tab (untuk toast di foreground)
    await broadcastToClients({ title, body: options.body, url: options.data.url, data: options.data });

    // cek ada tab yang visible? kalau ada, kita SKIP system notification (biar ga dobel)
    const clientsList = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    const hasVisibleClient = clientsList.some(c => {
      // WindowClient.visibilityState tidak ada di beberapa browser lama; fallback ke true
      return (/** @type any */(c)).visibilityState ? (/** @type any */(c)).visibilityState === 'visible' : true;
    });

    if (!hasVisibleClient) {
      // tidak ada tab visible → tampilkan popup system notification
      await self.registration.showNotification(title, options);
    }
  })());
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const urlToOpen = event.notification?.data?.url || '/';

  event.waitUntil((async () => {
    const allClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of allClients) {
      const url = new URL(client.url);
      if (url.pathname === new URL(urlToOpen, self.location.origin).pathname) {
        return client.focus();
      }
    }
    return clients.openWindow(urlToOpen);
  })());
});
