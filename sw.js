
const CACHE_NAME = 'phila-neon-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// Listener para notificações Push vindas do servidor/sistema
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {
    title: 'PhilaArchive Neon',
    body: 'Novidades no seu arquivo filatélico!',
    icon: 'https://cdn-icons-png.flaticon.com/512/2095/2095192.png'
  };

  const options = {
    body: data.body,
    icon: data.icon || 'https://cdn-icons-png.flaticon.com/512/2095/2095192.png',
    badge: 'https://cdn-icons-png.flaticon.com/512/2095/2095192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      { action: 'explore', title: 'Ver Acervo', icon: '' },
      { action: 'close', title: 'Fechar', icon: '' },
    ],
    tag: 'phila-update' // Evita duplicatas de notificações similares
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Listener para quando o usuário clica na notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Abre o aplicativo ou foca na aba já aberta
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus();
      }
      return clients.openWindow('/');
    })
  );
});
