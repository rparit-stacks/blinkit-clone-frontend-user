import { useCallback, useEffect, useState } from "react";
import {
  type SavedLocation,
  type ZoneCheckResult,
  checkDeliveryZone,
  getSavedLocation,
  reverseGeocode,
  saveLocation,
} from "@/lib/locationApi";

interface LocationState {
  location: SavedLocation | null;
  zone: ZoneCheckResult | null;
  loading: boolean;
  setLocation: (loc: SavedLocation) => Promise<void>;
  detectLocation: () => Promise<void>;
}

export function useLocation(): LocationState {
  const [location, setLocationState] = useState<SavedLocation | null>(getSavedLocation);
  const [zone, setZone] = useState<ZoneCheckResult | null>(null);
  const [loading, setLoading] = useState(false);

  const resolveZone = useCallback(async (loc: SavedLocation) => {
    try {
      const result = await checkDeliveryZone(loc.lat, loc.lng);
      setZone(result);
    } catch {
      // network error — don't block the UI
    }
  }, []);

  useEffect(() => {
    if (location) void resolveZone(location);
  }, [location, resolveZone]);

  const setLocation = useCallback(async (loc: SavedLocation) => {
    saveLocation(loc);
    setLocationState(loc);
    await resolveZone(loc);
  }, [resolveZone]);

  const detectLocation = useCallback(async () => {
    setLoading(true);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          maximumAge: 60000,
        })
      );
      const { latitude: lat, longitude: lng } = pos.coords;
      const label = await reverseGeocode(lat, lng);
      await setLocation({ lat, lng, label });
    } finally {
      setLoading(false);
    }
  }, [setLocation]);

  return { location, zone, loading, setLocation, detectLocation };
}
