import { isNativeApp } from "@/lib/nativeApp";

export type HapticStyle = "light" | "medium" | "confirm";

export function haptic(pattern: number | number[] = 10, style: HapticStyle = "light") {
  try {
    if (isNativeApp() && window.AndroidBridge) {
      if (style === "confirm") window.AndroidBridge.vibrateConfirm?.();
      else if (style === "medium") window.AndroidBridge.vibrateMedium?.();
      else window.AndroidBridge.vibrate?.();
      return;
    }
    if (typeof navigator === "undefined") return;
    if (!("vibrate" in navigator)) return;
    navigator.vibrate(pattern);
  } catch {
    // no-op
  }
}
