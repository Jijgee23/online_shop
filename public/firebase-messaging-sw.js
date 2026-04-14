importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBeUjKXulpS95iUvE--ADVoaz3uZ-SGpts",
  authDomain: "ishop-99ded.firebaseapp.com",
  projectId: "ishop-99ded",
  storageBucket: "ishop-99ded.firebasestorage.app",
  messagingSenderId: "39347484760",
  appId: "1:39347484760:web:a260fbcd1bbcb8ec2cf22d",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || payload.data?.title || 'Мэдэгдэл';
  const body  = payload.notification?.body  || payload.data?.body  || '';
  const link  = payload.data?.link || '/';

  self.registration.showNotification(title, {
    body,
    icon: '/logo.png',
    badge: '/logo.png',
    data: { link },
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const link = event.notification.data?.link || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(link);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(link);
    })
  );
});
