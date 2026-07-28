// public/firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCQw-TkkJSEKmtnzOeAcj4LlRrNPSU-rCY",
  authDomain: "droobtaxi-588fc.firebaseapp.com",
  projectId: "droobtaxi-588fc",
  messagingSenderId: "23234143934",
  appId: "1:23234143934:web:a82f3bd8dc64217d3da0ef"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message ', payload);

  // If your backend payload uses the "data" property instead of "notification"
  const notificationTitle = payload.data?.title || payload.notification?.title || 'New Message';
  const notificationOptions = {
    body: payload.data?.body || payload.notification?.body || '',
    icon: '/logo.png', // Ensure this is in your public folder!
    badge: '/logo.png'
  };

  // Only manually show if it isn't automatically handled 
  if (payload.data) {
    self.registration.showNotification(notificationTitle, notificationOptions);
  }
});