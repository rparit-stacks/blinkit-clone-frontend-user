import { useCallback, useEffect, useState } from "react";
import {
  FaChevronLeft,
  FaHome,
  FaBriefcase,
  FaMapMarkerAlt,
  FaLocationArrow,
  FaCheckCircle,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAccessToken, clearAccessToken } from "@/lib/api";
import type { AddressPayload } from "@/lib/userProfile";
import { fetchMyProfile, addMyAddress } from "@/lib/userProfile";
import { getSavedLocation, reverseGeocodeParsed } from "@/lib/locationApi";
import { isNativeApp, requestNativeLocationCoords } from "@/lib/nativeApp";
import { haptic } from "@/lib/haptics";

const labelOptions = ["Home", "Work", "Other"] as const;
const labelIcons: Record<string, React.ReactNode> = {
  Home: <FaHome className="w-3.5 h-3.5" />,
  Work: <FaBriefcase className="w-3.5 h-3.5" />,
  Other: <FaMapMarkerAlt className="w-3.5 h-3.5" />,
};

const AddressAdd = () => {
  const navigate = useNavigate();
  const [label, setLabel] = useState<(typeof labelOptions)[number]>("Home");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [pincode, setPincode] = useState("");
  const [isDefault, setIsDefault] = useState(true);
  const [saving, setSaving] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [detectedLabel, setDetectedLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!getAccessToken()) {
      navigate("/auth", { replace: true });
      return;
    }
    (async () => {
      try {
        const p = await fetchMyProfile();
        if (!p) {
          clearAccessToken();
          navigate("/auth", { replace: true });
          return;
        }
        if (!p.onboardingCompleted) {
          navigate("/onboarding", { replace: true });
          return;
        }
        setIsDefault((p.addresses?.length ?? 0) === 0);
      } catch {
        /* continue */
      }
    })();
  }, [navigate]);

  const applyParsed = useCallback((parsed: Awaited<ReturnType<typeof reverseGeocodeParsed>>) => {
    if (parsed.line1) setLine1(parsed.line1);
    if (parsed.line2) setLine2(parsed.line2);
    if (parsed.city) setCity(parsed.city);
    if (parsed.state) setStateVal(parsed.state);
    if (parsed.pincode) setPincode(parsed.pincode);
    if (parsed.displayLabel) setDetectedLabel(parsed.displayLabel);
  }, []);

  const detectLocation = useCallback(async () => {
    setDetecting(true);
    setDetectedLabel(null);
    try {
      if (isNativeApp()) {
        const coords = await requestNativeLocationCoords();
        if (coords) {
          const parsed = await reverseGeocodeParsed(coords.lat, coords.lng);
          applyParsed(parsed);
          haptic(10, "light");
          toast.success("Location detected");
          return;
        }
      }

      const saved = getSavedLocation();
      if (saved) {
        const parsed = await reverseGeocodeParsed(saved.lat, saved.lng);
        applyParsed(parsed);
        haptic("light");
        toast.success("Filled from your saved location");
        return;
      }

      await new Promise<void>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Location not supported"));
          return;
        }
        navigator.geolocation.getCurrentPosition(
          async ({ coords }) => {
            try {
              const parsed = await reverseGeocodeParsed(coords.latitude, coords.longitude);
              applyParsed(parsed);
              haptic(10, "light");
              toast.success("Location detected");
              resolve();
            } catch (e) {
              reject(e);
            }
          },
          () => reject(new Error("Could not get GPS location")),
          { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
        );
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not detect location");
    } finally {
      setDetecting(false);
    }
  }, [applyParsed]);

  useEffect(() => {
    void detectLocation();
  }, [detectLocation]);

  const save = async () => {
    if (!line1.trim() || !city.trim() || !pincode.trim()) {
      toast.error("House/street, city, and pincode are required");
      return;
    }
    setSaving(true);
    try {
      const body: Omit<AddressPayload, "id"> = {
        label,
        line1: line1.trim(),
        line2: line2.trim() || undefined,
        city: city.trim(),
        state: stateVal.trim() || undefined,
        pincode: pincode.trim(),
        defaultAddress: isDefault,
      };
      await addMyAddress(body);
      haptic(20, "medium");
      toast.success("Address saved");
      navigate("/addresses", { replace: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mobile-page bg-background min-h-[100dvh] flex flex-col">
      <header className="sticky top-0 z-50 bg-[#F7F3FF] border-b border-violet-100/60 px-4 py-3 flex items-center gap-3 shrink-0">
        <Link
          to="/addresses"
          className="w-9 h-9 rounded-full bg-white/90 border border-violet-100 flex items-center justify-center text-foreground"
        >
          <FaChevronLeft className="w-3.5 h-3.5" />
        </Link>
        <h1 className="text-base font-bold text-foreground">Add address</h1>
      </header>

      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-4 space-y-4 pb-28">
        <button
          type="button"
          onClick={() => void detectLocation()}
          disabled={detecting}
          className="w-full flex items-center gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/20 text-left active:scale-[0.99] transition-transform"
        >
          <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center shrink-0">
            <FaLocationArrow className={`w-4 h-4 text-white ${detecting ? "animate-pulse" : ""}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">
              {detecting ? "Detecting your location…" : "Use current location"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {detectedLabel || "Tap to refresh GPS and auto-fill fields"}
            </p>
          </div>
        </button>

        {detectedLabel && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs">
            <FaCheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{detectedLabel}</span>
          </div>
        )}

        <div className="bg-card rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-4 space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Save as</Label>
            <div className="flex gap-2 mt-2">
              {labelOptions.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setLabel(t)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold border transition-colors ${
                    label === t
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {labelIcons[t]}
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>House / Street *</Label>
            <Input value={line1} onChange={(e) => setLine1(e.target.value)} className="mt-1.5" placeholder="Flat, building, street" />
          </div>
          <div>
            <Label>Area / Landmark</Label>
            <Input value={line2} onChange={(e) => setLine2(e.target.value)} className="mt-1.5" placeholder="Colony, landmark (optional)" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>City *</Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label>Pincode *</Label>
              <Input value={pincode} onChange={(e) => setPincode(e.target.value)} className="mt-1.5" inputMode="numeric" maxLength={6} />
            </div>
          </div>
          <div>
            <Label>State</Label>
            <Input value={stateVal} onChange={(e) => setStateVal(e.target.value)} className="mt-1.5" placeholder="Uttarakhand" />
          </div>

          <label className="flex items-center gap-2.5 text-sm text-foreground py-1">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary"
            />
            Set as default delivery address
          </label>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 border-t border-border backdrop-blur-sm safe-area-pb">
        <div className="max-w-lg mx-auto">
          <Button className="w-full h-12 rounded-xl text-base font-semibold" onClick={() => void save()} disabled={saving}>
            {saving ? "Saving…" : "Save address"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddressAdd;
