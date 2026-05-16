import { requestPushPermission, onForegroundMessage } from "./firebase";
import { apiPost, getAccessToken } from "./api";
import { isNativeApp } from "./nativeApp";
import { dispatchNotificationNavigate, resolveNotificationPath } from "./notificationNavigation";
import { toast } from "sonner";

const REGISTERED_TOKEN_KEY = "fcm_registered_token";

async function registerTokenWithBackend(token: string, platform: "WEB" | "ANDROID"): Promise<void> {
  const storageKey = `${REGISTERED_TOKEN_KEY}:${platform}`;
  const already = localStorage.getItem(storageKey);
  if (already === token) return;
  try {
    await apiPost("/api/user/push-token", { token, platform });
    localStorage.setItem(storageKey, token);
  } catch (e) {
    console.warn("Failed to register push token:", e);
  }
}

function waitForNativeFcmToken(timeoutMs = 8000): Promise<string | null> {
  if (!isNativeApp()) return Promise.resolve(null);

  const existing = window.__nativeFcmToken;
  if (existing) return Promise.resolve(existing);

  try {
    const bridge = window.AndroidBridge?.getFcmToken?.();
    if (bridge) {
      window.__nativeFcmToken = bridge;
      return Promise.resolve(bridge);
    }
  } catch {
    /* bridge not ready */
  }

  return new Promise((resolve) => {
    let done = false;
    const finish = (token: string | null) => {
      if (done) return;
      done = true;
      window.clearTimeout(timer);
      window.removeEventListener("naini-native-fcm-token", onToken);
      resolve(token);
    };

    const onToken = (e: Event) => {
      const token = (e as CustomEvent<{ token: string }>).detail?.token;
      if (token) {
        window.__nativeFcmToken = token;
        finish(token);
      }
    };

    window.__onNativeFcmToken = (token: string) => {
      window.__nativeFcmToken = token;
      finish(token);
    };

    const timer = window.setTimeout(() => finish(window.__nativeFcmToken ?? null), timeoutMs);
    window.addEventListener("naini-native-fcm-token", onToken);
  });
}

/**
 * Call after login: register device for push (Web FCM or native Android token).
 */
export async function initPushNotifications(): Promise<void> {
  if (!getAccessToken()) return;

  if (isNativeApp()) {
    const token = await waitForNativeFcmToken();
    if (token) await registerTokenWithBackend(token, "ANDROID");
  } else {
    const token = await requestPushPermission();
    if (token) await registerTokenWithBackend(token, "WEB");
  }

  onForegroundMessage((title, body, data) => {
    toast(title, { description: body, duration: 5000 });
    const path = resolveNotificationPath(data);
    dispatchNotificationNavigate(path);
  });
}

/** Re-register when native token refreshes (app resume). */
export function subscribeNativePushTokenRefresh(): () => void {
  if (!isNativeApp()) return () => {};

  const onToken = async (e: Event) => {
    if (!getAccessToken()) return;
    const token = (e as CustomEvent<{ token: string }>).detail?.token;
    if (token) await registerTokenWithBackend(token, "ANDROID");
  };

  window.addEventListener("naini-native-fcm-token", onToken);
  return () => window.removeEventListener("naini-native-fcm-token", onToken);
}

export function clearPushToken(): void {
  localStorage.removeItem(REGISTERED_TOKEN_KEY);
  localStorage.removeItem(`${REGISTERED_TOKEN_KEY}:WEB`);
  localStorage.removeItem(`${REGISTERED_TOKEN_KEY}:ANDROID`);
  localStorage.removeItem("fcm_push_token");
}
