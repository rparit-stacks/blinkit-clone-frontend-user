declare global {
  interface Window {
    AndroidBridge?: {
      vibrate: () => void;
      vibrateMedium: () => void;
      vibrateConfirm: () => void;
      isNativeApp: () => boolean;
      getAppVersion: () => string;
      requestLocation: () => void;
      getFcmToken: () => string;
    };
    __nativeLocation?: (lat: number, lng: number) => void;
    __pendingNativeLocation?: { lat: number; lng: number };
    __nativeFcmToken?: string;
    __onNativeFcmToken?: (token: string) => void;
    __pendingNativeDeepLink?: string;
  }
}

/** React Router navigation when user taps a native push notification. */
export function onNativeDeepLink(handler: (path: string) => void): () => void {
  const run = (path: string) => {
    if (path.startsWith("/")) handler(path);
  };

  const pending = window.__pendingNativeDeepLink;
  if (pending) {
    run(pending);
    delete window.__pendingNativeDeepLink;
  }

  const onEvent = (e: Event) => {
    const path = (e as CustomEvent<{ path: string }>).detail?.path;
    if (path) run(path);
  };

  window.addEventListener("naini-native-deeplink", onEvent);
  return () => window.removeEventListener("naini-native-deeplink", onEvent);
}

export function isNativeApp(): boolean {
  try {
    return window.AndroidBridge?.isNativeApp?.() === true;
  } catch {
    return false;
  }
}

export function requestNativeLocation(): void {
  try {
    window.AndroidBridge?.requestLocation?.();
  } catch {
    // no-op
  }
}

export type NativeCoords = { lat: number; lng: number };

/** One-shot GPS request via Android bridge (handles grant, deny, timeout). */
export function requestNativeLocationCoords(options?: {
  timeoutMs?: number;
}): Promise<NativeCoords | null> {
  const timeoutMs = options?.timeoutMs ?? 20_000;

  if (!isNativeApp()) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    let settled = false;

    const finish = (value: NativeCoords | null) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      window.removeEventListener("naini-native-location", onSuccess);
      window.removeEventListener("naini-native-location-denied", onDenied);
      resolve(value);
    };

    const onSuccess = (e: Event) => {
      const detail = (e as CustomEvent<NativeCoords>).detail;
      if (detail?.lat != null && detail?.lng != null) {
        finish({ lat: detail.lat, lng: detail.lng });
      }
    };

    const onDenied = () => finish(null);

    const timer = window.setTimeout(() => finish(null), timeoutMs);

    window.addEventListener("naini-native-location", onSuccess);
    window.addEventListener("naini-native-location-denied", onDenied);

    requestNativeLocation();
  });
}

type NativeLocationHandler = (lat: number, lng: number) => void;

/** Subscribe to native GPS updates (e.g. on app start). */
export function onNativeLocation(handler: NativeLocationHandler): () => void {
  const onCoords = (lat: number, lng: number) => handler(lat, lng);

  window.__nativeLocation = onCoords;

  const pending = window.__pendingNativeLocation;
  if (pending) {
    onCoords(pending.lat, pending.lng);
    delete window.__pendingNativeLocation;
  }

  const onEvent = (e: Event) => {
    const detail = (e as CustomEvent<NativeCoords>).detail;
    if (detail?.lat != null && detail?.lng != null) onCoords(detail.lat, detail.lng);
  };

  window.addEventListener("naini-native-location", onEvent);

  return () => {
    window.removeEventListener("naini-native-location", onEvent);
    if (window.__nativeLocation === onCoords) delete window.__nativeLocation;
  };
}
