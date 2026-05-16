import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithCredential, OAuthCredential } from "firebase/auth";
import { getMessaging, getToken, onMessage, type Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "AIzaSyDkUhAyBcvX0NPpQjYRuQU-_vcIQB2jP-o",
  authDomain: "smart-split-828c5.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "smart-split-828c5",
  storageBucket: "smart-split-828c5.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "765128766308",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "1:765128766308:web:f03c9498d7bd6a6503c071",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

/** Exchange Google GSI credential → Firebase ID token */
export async function getFirebaseIdTokenFromGoogleCredential(googleJwt: string): Promise<string> {
  const credential: OAuthCredential = GoogleAuthProvider.credential(googleJwt);
  const result = await signInWithCredential(auth, credential);
  return result.user.getIdToken();
}

// ─── FCM Web Push Notifications ───────────────────────────────────────────────

let _messaging: Messaging | null = null;

function getMessagingInstance(): Messaging | null {
  if (_messaging) return _messaging;
  try {
    _messaging = getMessaging(app);
    return _messaging;
  } catch {
    return null;
  }
}

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;
const FCM_TOKEN_KEY = "fcm_push_token";

/**
 * Request notification permission and get FCM registration token.
 * Returns the token string, or null if denied / not supported / VAPID key missing.
 */
export async function requestPushPermission(): Promise<string | null> {
  if (typeof window === "undefined" || !("Notification" in window)) return null;
  if (!VAPID_KEY) return null;
  if (!("serviceWorker" in navigator)) return null;

  const messaging = getMessagingInstance();
  if (!messaging) return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    const swReg = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: swReg });

    if (token) localStorage.setItem(FCM_TOKEN_KEY, token);
    return token ?? null;
  } catch (e) {
    console.warn("FCM push token error:", e);
    return null;
  }
}

export function getStoredFcmToken(): string | null {
  return localStorage.getItem(FCM_TOKEN_KEY);
}

/**
 * Listen for foreground messages (tab is open).
 * Returns an unsubscribe function.
 */
export function onForegroundMessage(
  callback: (title: string, body: string, data: Record<string, string>) => void
): () => void {
  const messaging = getMessagingInstance();
  if (!messaging) return () => {};
  return onMessage(messaging, (payload) => {
    const title = payload.notification?.title ?? payload.data?.title ?? "NainiStore";
    const body = payload.notification?.body ?? payload.data?.body ?? "";
    callback(title, body, (payload.data ?? {}) as Record<string, string>);
  });
}
