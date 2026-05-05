importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyBSCOpel9KnhfB0Dt6E6TPr-7WSq_f2yv8",
  authDomain: "collabx-9999.firebaseapp.com",
  projectId: "collabx-9999",
  storageBucket: "collabx-9999.firebasestorage.app",
  messagingSenderId: "942548621743",
  appId: "1:942548621743:web:c9bf10a3252a0f493ab75a"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || "New Notification";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new message.",
    icon: '/icon-192x192.png',
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
