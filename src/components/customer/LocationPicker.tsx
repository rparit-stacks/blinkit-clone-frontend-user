import { useEffect, useRef, useState } from "react";
import { FaTimes, FaSearch, FaLocationArrow, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import type { SavedLocation, NominatimResult } from "@/lib/locationApi";
import { reverseGeocode, searchAddress } from "@/lib/locationApi";

// Default center: Nainital, Uttarakhand
const NAINITAL_CENTER: [number, number] = [29.3803, 79.4636];

interface Props {
  initial?: SavedLocation | null;
  onConfirm: (loc: SavedLocation) => void;
  onClose: () => void;
  inZone?: boolean | null;
}

export default function LocationPicker({ initial, onConfirm, onClose, inZone }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);

  const [lat, setLat] = useState(initial?.lat ?? NAINITAL_CENTER[0]);
  const [lng, setLng] = useState(initial?.lng ?? NAINITAL_CENTER[1]);
  const [label, setLabel] = useState(initial?.label ?? "");
  const [loadingLabel, setLoadingLabel] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [detecting, setDetecting] = useState(false);

  // Bootstrap Leaflet lazily (avoids SSR issues)
  useEffect(() => {
    if (!mapRef.current) return;

    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;

      // Fix default icon paths broken by bundlers
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (cancelled || !mapRef.current) return;

      const map = L.map(mapRef.current, { zoomControl: true }).setView(
        [lat, lng], 15
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([lat, lng], { draggable: true }).addTo(map);

      marker.on("dragend", async () => {
        const pos = marker.getLatLng();
        setLat(pos.lat);
        setLng(pos.lng);
        setLoadingLabel(true);
        const lbl = await reverseGeocode(pos.lat, pos.lng);
        setLabel(lbl);
        setLoadingLabel(false);
      });

      map.on("click", async (e) => {
        marker.setLatLng(e.latlng);
        setLat(e.latlng.lat);
        setLng(e.latlng.lng);
        setLoadingLabel(true);
        const lbl = await reverseGeocode(e.latlng.lat, e.latlng.lng);
        setLabel(lbl);
        setLoadingLabel(false);
      });

      leafletMap.current = map;
      markerRef.current = marker;

      // Resolve initial label if missing
      if (!initial?.label) {
        setLoadingLabel(true);
        const lbl = await reverseGeocode(lat, lng);
        if (!cancelled) { setLabel(lbl); }
        setLoadingLabel(false);
      }
    })();

    return () => {
      cancelled = true;
      leafletMap.current?.remove();
      leafletMap.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const moveTo = (newLat: number, newLng: number, newLabel: string) => {
    setLat(newLat);
    setLng(newLng);
    setLabel(newLabel);
    setResults([]);
    setSearch("");
    if (leafletMap.current && markerRef.current) {
      leafletMap.current.setView([newLat, newLng], 16);
      markerRef.current.setLatLng([newLat, newLng]);
    }
  };

  const handleSearch = async () => {
    if (!search.trim()) return;
    setSearching(true);
    const res = await searchAddress(search);
    setResults(res);
    setSearching(false);
  };

  const handleDetect = async () => {
    setDetecting(true);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 })
      );
      const { latitude: la, longitude: lo } = pos.coords;
      const lbl = await reverseGeocode(la, lo);
      moveTo(la, lo, lbl);
    } catch {
      // permission denied or timeout — ignore
    } finally {
      setDetecting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-white">
        <button type="button" onClick={onClose} className="p-1.5 rounded-full hover:bg-muted">
          <FaTimes className="w-4 h-4 text-foreground" />
        </button>
        <h2 className="text-sm font-bold text-foreground flex-1">Choose Delivery Location</h2>
        <button
          type="button"
          onClick={handleDetect}
          disabled={detecting}
          className="flex items-center gap-1.5 text-xs font-semibold text-primary"
        >
          <FaLocationArrow className="w-3.5 h-3.5" />
          {detecting ? "Detecting…" : "Use GPS"}
        </button>
      </div>

      {/* Search bar */}
      <div className="px-4 py-2 bg-white border-b">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-border text-sm bg-muted/50 focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Search area, landmark, pincode…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void handleSearch()}
            />
          </div>
          <button
            type="button"
            onClick={() => void handleSearch()}
            disabled={searching}
            className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold"
          >
            {searching ? "…" : "Search"}
          </button>
        </div>

        {results.length > 0 && (
          <ul className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-border bg-white shadow-sm divide-y divide-border">
            {results.map((r, i) => (
              <li key={i}>
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-xs hover:bg-muted/50"
                  onClick={() => moveTo(parseFloat(r.lat), parseFloat(r.lon),
                    r.display_name.split(",").slice(0, 2).join(", "))}
                >
                  {r.display_name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="w-full h-full" />

        {/* Crosshair hint */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[10px] px-2.5 py-1 rounded-full pointer-events-none">
          Tap map or drag pin to adjust
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t px-4 py-3 space-y-2">
        {/* Zone status */}
        {inZone !== null && inZone !== undefined && (
          <div className={`flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg ${
            inZone ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
          }`}>
            {inZone
              ? <><FaCheckCircle className="w-3.5 h-3.5" /> We deliver here!</>
              : <><FaTimesCircle className="w-3.5 h-3.5" /> Sorry, outside delivery zone</>
            }
          </div>
        )}

        <div className="text-xs text-muted-foreground truncate">
          {loadingLabel ? "Resolving address…" : label || `${lat.toFixed(5)}, ${lng.toFixed(5)}`}
        </div>

        <button
          type="button"
          className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-bold"
          onClick={() => onConfirm({ lat, lng, label: label || `${lat.toFixed(5)}, ${lng.toFixed(5)}` })}
        >
          Confirm Location
        </button>
      </div>
    </div>
  );
}
