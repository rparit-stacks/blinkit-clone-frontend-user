export function haptic(pattern: number | number[] = 10) {
  try {
    if (typeof navigator === "undefined") return;
    if (!("vibrate" in navigator)) return;
    // Keep it subtle; browsers may ignore or throttle.
    navigator.vibrate(pattern);
  } catch {
    // no-op
  }
}

