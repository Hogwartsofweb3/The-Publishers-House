// Service Worker for The Publishers House Portal Push Notifications
const CACHE_NAME = 'tph-portal-v1';

// Install event
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Push event — triggered when server sends a notification
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'The Publishers House', body: event.data.text() };
  }

  const {
    title = 'The Publishers House',
    body = 'You have a new update.',
    icon = '/icon-192x192.png',
    badge = '/icon-192x192.png',
    link = '/portal/member',
    tag = 'tph-notification',
  } = payload;

  const options = {
    body,
    icon,
    badge,
    tag,
    data: { link },
    vibrate: [100, 50, 100],
    requireInteraction: false,
    actions: [
      { action: 'open', title: 'Open Portal' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click — open the deep link
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const link = (event.notification.data && event.notification.data.link) || '/portal/member';
  const targetUrl = new URL(link, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If portal is already open, focus it and navigate
      for (const client of windowClients) {
        if (client.url.includes('/portal') && 'focus' in client) {
          client.focus();
          if ('navigate' in client) client.navigate(targetUrl);
          return;
        }
      }
      // Otherwise open a new tab
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
