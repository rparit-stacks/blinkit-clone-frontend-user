import { publicPost } from "@/lib/api";

export interface ZoneCheckResult {
  inZone: boolean;
  zoneName: string | null;
  etaLabel: string | null;
  message: string;
  deliveryFee: number;
  minOrderForFree: number;
}

export async function checkDeliveryZone(lat: number, lng: number): Promise<ZoneCheckResult> {
  return publicPost<ZoneCheckResult>("/api/zones/check", { lat, lng });
}

export interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    road?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
  const res = await fetch(url, { headers: { "Accept-Language": "en" } });
  if (!res.ok) return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  const data = (await res.json()) as NominatimResult;
  const a = data.address;
  const parts = [
    a.road,
    a.suburb,
    a.city || a.town || a.village,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : data.display_name.split(",")[0];
}

export async function searchAddress(query: string): Promise<NominatimResult[]> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`;
  const res = await fetch(url, { headers: { "Accept-Language": "en" } });
  if (!res.ok) return [];
  return res.json() as Promise<NominatimResult[]>;
}

export interface SavedLocation {
  lat: number;
  lng: number;
  label: string;
}

const LOCATION_KEY = "nani_location";

export function getSavedLocation(): SavedLocation | null {
  try {
    const raw = localStorage.getItem(LOCATION_KEY);
    return raw ? (JSON.parse(raw) as SavedLocation) : null;
  } catch {
    return null;
  }
}

export function saveLocation(loc: SavedLocation): void {
  localStorage.setItem(LOCATION_KEY, JSON.stringify(loc));
}

export function clearLocation(): void {
  localStorage.removeItem(LOCATION_KEY);
}
