import { useCallback, useEffect, useState } from "react";
import { FaChevronLeft, FaHome, FaBriefcase, FaMapMarkerAlt, FaPlus, FaTimes, FaTrash, FaStar } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import BottomNav from "@/components/customer/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAccessToken, clearAccessToken } from "@/lib/api";
import type { AddressPayload, UserProfile } from "@/lib/userProfile";
import { fetchMyProfile, addMyAddress, deleteMyAddress, setDefaultAddress } from "@/lib/userProfile";

const typeIcons: Record<string, React.ReactNode> = {
  Home: <FaHome className="w-4 h-4" />,
  Work: <FaBriefcase className="w-4 h-4" />,
  Other: <FaMapMarkerAlt className="w-4 h-4" />,
};

const Addresses = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [label, setLabel] = useState("Home");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [pincode, setPincode] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const load = useCallback(async () => {
    if (!getAccessToken()) { navigate("/auth", { replace: true }); return; }
    setLoading(true);
    try {
      const p = await fetchMyProfile();
      if (!p) { clearAccessToken(); navigate("/auth", { replace: true }); return; }
      if (!p.onboardingCompleted) { navigate("/onboarding", { replace: true }); return; }
      setProfile(p);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { void load(); }, [load]);

  const onDelete = async (id: string | undefined) => {
    if (!id) return;
    try {
      const updated = await deleteMyAddress(id);
      setProfile(updated);
      toast.success("Address removed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const onSetDefault = async (id: string | undefined) => {
    if (!id) return;
    try {
      const updated = await setDefaultAddress(id);
      setProfile(updated);
      toast.success("Default address updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update default");
    }
  };

  const saveNew = async () => {
    if (!line1.trim() || !city.trim() || !pincode.trim()) {
      toast.error("Line 1, city, and pincode are required");
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
      const updated = await addMyAddress(body);
      setProfile(updated);
      setShowModal(false);
      setLine1(""); setLine2(""); setCity(""); setStateVal(""); setPincode(""); setIsDefault(false);
      toast.success("Address saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const addresses = profile?.addresses ?? [];

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-50 bg-[#F7F3FF] border-b border-violet-100/60 px-4 py-3 flex items-center gap-3">
        <Link to="/profile" className="w-9 h-9 rounded-full bg-white/90 border border-violet-100 flex items-center justify-center text-foreground">
          <FaChevronLeft className="w-3.5 h-3.5" />
        </Link>
        <h1 className="text-base font-bold text-foreground">Saved Addresses</h1>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
        {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!loading && addresses.map((addr) => (
          <div key={addr.id ?? `${addr.line1}-${addr.pincode}`} className="bg-card rounded-card shadow-card p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                {typeIcons[addr.label] || <FaMapMarkerAlt className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">{addr.label}</span>
                  {addr.defaultAddress && (
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-pill">Default</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}
                  {addr.state ? `, ${addr.state}` : ""} {addr.pincode}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!addr.defaultAddress && (
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-primary"
                    onClick={() => void onSetDefault(addr.id)}
                    aria-label="Set as default"
                    title="Set as default"
                  >
                    <FaStar className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => void onDelete(addr.id)}
                  aria-label="Delete address"
                >
                  <FaTrash className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="w-full bg-card rounded-card shadow-card p-4 flex items-center justify-center gap-2 text-primary border-2 border-dashed border-primary/30"
        >
          <FaPlus className="w-4 h-4" />
          <span className="text-sm font-medium">Add New Address</span>
        </button>
      </div>

      {/* Add address modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end lg:items-center justify-center p-4">
          <div className="bg-card rounded-t-modal lg:rounded-modal w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">Add Address</h3>
              <button type="button" onClick={() => setShowModal(false)}>
                <FaTimes className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["Home", "Work", "Other"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setLabel(t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border ${label === t ? "border-primary bg-primary/10" : "border-border"}`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div><Label>Line 1 *</Label><Input value={line1} onChange={(e) => setLine1(e.target.value)} className="mt-1" /></div>
            <div><Label>Line 2</Label><Input value={line2} onChange={(e) => setLine2(e.target.value)} className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>City *</Label><Input value={city} onChange={(e) => setCity(e.target.value)} className="mt-1" /></div>
              <div><Label>Pincode *</Label><Input value={pincode} onChange={(e) => setPincode(e.target.value)} className="mt-1" inputMode="numeric" /></div>
            </div>
            <div><Label>State</Label><Input value={stateVal} onChange={(e) => setStateVal(e.target.value)} className="mt-1" /></div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
              Set as default
            </label>
            <Button className="w-full" onClick={() => void saveNew()} disabled={saving}>
              {saving ? "Saving…" : "Save Address"}
            </Button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default Addresses;
