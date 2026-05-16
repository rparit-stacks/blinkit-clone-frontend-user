import { useEffect, useRef, useState } from "react";
import LocationPicker from "@/components/customer/LocationPicker";
import { useLocation } from "@/hooks/use-location";
import { getSavedLocation, reverseGeocode } from "@/lib/locationApi";
import { isNativeApp, onNativeLocation, requestNativeLocationCoords } from "@/lib/nativeApp";

const PROMPT_KEY = "nani_location_prompted";

/**
 * On native app start: if no saved delivery location, request GPS and open the picker.
 */
export default function NativeLocationPrompt() {
  const { location, setLocation } = useLocation();
  const [showPicker, setShowPicker] = useState(false);
  const handled = useRef(false);

  useEffect(() => {
    if (!isNativeApp() || handled.current) return;
    if (getSavedLocation()) return;

    handled.current = true;

    const unsub = onNativeLocation(async (lat, lng) => {
      try {
        const label = await reverseGeocode(lat, lng);
        await setLocation({ lat, lng, label });
      } catch {
        await setLocation({ lat, lng, label: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
      }
      setShowPicker(true);
    });

    if (!sessionStorage.getItem(PROMPT_KEY)) {
      sessionStorage.setItem(PROMPT_KEY, "1");
      void requestNativeLocationCoords({ timeoutMs: 20_000 }).then((coords) => {
        if (coords) return;
        setShowPicker(true);
      });
    } else {
      setShowPicker(true);
    }

    return () => {
      unsub();
    };
  }, [setLocation]);

  // Browser/PWA: prompt once if no location
  useEffect(() => {
    if (isNativeApp() || handled.current) return;
    if (getSavedLocation()) return;
    if (sessionStorage.getItem(PROMPT_KEY)) return;

    handled.current = true;
    sessionStorage.setItem(PROMPT_KEY, "1");
    setShowPicker(true);
  }, []);

  if (!showPicker) return null;

  return (
    <LocationPicker
      initial={location}
      onConfirm={async (loc) => {
        await setLocation(loc);
        setShowPicker(false);
      }}
      onClose={() => setShowPicker(false)}
    />
  );
}
