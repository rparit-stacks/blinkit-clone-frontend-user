// Firebase Messaging Service Worker
// This file MUST be at the root (public/) — served at /firebase-messaging-sw.js
// It runs in the background even when the web app tab is closed.

importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

// These values are replaced at build time via the __FIREBASE_CONFIG__ placeholder,
// or fall back to the hardcoded values for local dev.
const firebaseConfig = self.__FIREBASE_CONFIG__ ?? {
  apiKey: "AIzaSyDkUhAyBcvX0NPpQjYRuQU-_vcIQB2jP-o",
  authDomain: "smart-split-828c5.firebaseapp.com",
  projectId: "smart-split-828c5",
  storageBucket: "smart-split-828c5.firebasestorage.app",
  messagingSenderId: "765128766308",
  appId: "1:765128766308:web:f03c9498d7bd6a6503c071",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background push messages (app tab closed / backgrounded)
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title ?? payload.data?.title ?? "NainiStore";
  const body = payload.notification?.body ?? payload.data?.body ?? "";
  const icon = "/favicon.ico";
  const badge = "/favicon.ico";
  const tag = payload.data?.type ?? "nainistore";
  const data = payload.data ?? {};

  self.registration.showNotification(title, {
    body,
    icon,
    badge,
    tag,
    data,
    vibrate: [200, 100, 200],
    requireInteraction: false,
  });
});

function resolvePath(data) {
  if (data.clickUrl && String(data.clickUrl).startsWith("/")) return data.clickUrl;
  if (data.relatedEntityKind === "ORDER" && data.relatedEntityId) {
    return `/order-tracking/${data.relatedEntityId}`;
  }
  return "/notifications";
}

// When user taps the notification
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const data = event.notification.data ?? {};
  const url = resolvePath(data);
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
