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
  const parsed = await reverseGeocodeParsed(lat, lng);
  return parsed.displayLabel;
}

export type ParsedAddress = {
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  displayLabel: string;
};

export async function reverseGeocodeParsed(lat: number, lng: number): Promise<ParsedAddress> {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
  const res = await fetch(url, { headers: { "Accept-Language": "en" } });
  if (!res.ok) {
    return {
      line1: "",
      line2: "",
      city: "",
      state: "",
      pincode: "",
      displayLabel: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    };
  }
  const data = (await res.json()) as NominatimResult & {
    address?: NominatimResult["address"] & {
      house_number?: string;
      postcode?: string;
      state_district?: string;
    };
  };
  const a = data.address ?? {};
  const line1 = [a.house_number, a.road].filter(Boolean).join(" ").trim()
    || a.suburb
    || data.display_name.split(",")[0]?.trim()
    || "";
  const line2 = a.suburb && a.suburb !== line1 ? a.suburb : "";
  const city = (a.city || a.town || a.village || "").trim();
  const state = (a.state || a.state_district || "").trim();
  const pincode = (a.postcode || "").trim();
  const parts = [line1, line2, city].filter(Boolean);
  return {
    line1,
    line2,
    city,
    state,
    pincode,
    displayLabel: parts.length > 0 ? parts.join(", ") : data.display_name.split(",")[0]?.trim() ?? "",
  };
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
