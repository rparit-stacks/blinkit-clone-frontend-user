/**
 * NaniStore Android injects {@link Window.AndroidGoogleSignIn} and calls
 * {@link Window.__resolveNativeGoogleJwt} with the app JWT after native Google Sign-In
 * and backend exchange (stored encrypted on device).
 */
declare global {
  interface Window {
    AndroidGoogleSignIn?: {
      requestGoogleSignInAndExchange: () => void;
      /** Injected by NaniStore MainActivity when Web client ID is set in strings.xml */
      isGoogleSignInReady?: () => boolean;
    };
    __resolveNativeGoogleJwt?: (accessToken: string) => void;
  }
}

type Pending = { resolve: (token: string) => void; reject: (err: Error) => void };

let pending: Pending | null = null;
let timeoutId: ReturnType<typeof setTimeout> | null = null;

export function installNativeGoogleTokenResolver() {
  window.__resolveNativeGoogleJwt = (accessToken: string) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    if (!pending) return;
    if (!accessToken || accessToken.trim() === "") {
      pending.reject(new Error("Google Sign-In was cancelled or auth exchange failed"));
      pending = null;
      return;
    }
    pending.resolve(accessToken.trim());
    pending = null;
  };
}

export function isNativeGoogleSignInAvailable(): boolean {
  return typeof window.AndroidGoogleSignIn?.requestGoogleSignInAndExchange === "function";
}

/** NaniStore Android WebView sets this in the User-Agent (see MainActivity). */
export function isNaniStoreAndroidWebView(): boolean {
  return /NaniStoreAndroid\//i.test(navigator.userAgent || "");
}

/** Native picker is required in the app shell — never use embedded GIS iframe there. */
export function useDeviceGoogleAccountPicker(): boolean {
  return isNativeGoogleSignInAvailable() || isNaniStoreAndroidWebView();
}

/** False only when the app exposes readiness and Google client is not configured in strings.xml. */
export function isNativeGoogleConfiguredOnAndroid(): boolean {
  try {
    const iface = window.AndroidGoogleSignIn;
    if (!iface || typeof iface.isGoogleSignInReady !== "function") {
      return true;
    }
    return iface.isGoogleSignInReady() === true;
  } catch {
    return true;
  }
}

/** Resolves with app JWT after native account picker + POST /auth/google-login on device. */
export function requestNativeGoogleJwt(): Promise<string> {
  if (!isNativeGoogleSignInAvailable()) {
    return Promise.reject(new Error("Native Google Sign-In is not ready yet. Try again."));
  }
  return new Promise((resolve, reject) => {
    if (pending) {
      pending.reject(new Error("Sign-in already in progress"));
    }
    pending = { resolve, reject };
    timeoutId = setTimeout(() => {
      timeoutId = null;
      if (pending) {
        pending.reject(new Error("Google Sign-In timed out"));
        pending = null;
      }
    }, 120_000);
    try {
      window.AndroidGoogleSignIn!.requestGoogleSignInAndExchange();
    } catch (e) {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      pending = null;
      reject(e instanceof Error ? e : new Error(String(e)));
    }
  });
}
