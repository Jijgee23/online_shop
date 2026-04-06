importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBeUjKXulpS95iUvE--ADVoaz3uZ-SGpts",
  authDomain: "ishop-99ded.firebaseapp.com",
  projectId: "ishop-99ded",
  storageBucket: "ishop-99ded.firebasestorage.app",
  messagingSenderId: "39347484760",
  appId: "1:39347484760:web:a260fbcd1bbcb8ec2cf22d",
});

const messaging = firebase.messaging();

// Background мэдэгдэл хүлээн авах
messaging.onBackgroundMessage((payload) => {
  console.log('Background message: ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png' // Өөрийн логоны замыг тавина
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});