import { useCallback, useEffect, useState } from "react";
import { FaChevronLeft, FaHome, FaBriefcase, FaMapMarkerAlt, FaPlus, FaTrash, FaStar } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import BottomNav from "@/components/customer/BottomNav";
import { getAccessToken, clearAccessToken } from "@/lib/api";
import type { UserProfile } from "@/lib/userProfile";
import { fetchMyProfile, deleteMyAddress, setDefaultAddress } from "@/lib/userProfile";

const typeIcons: Record<string, React.ReactNode> = {
  Home: <FaHome className="w-4 h-4" />,
  Work: <FaBriefcase className="w-4 h-4" />,
  Other: <FaMapMarkerAlt className="w-4 h-4" />,
};

const Addresses = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!getAccessToken()) {
      navigate("/auth", { replace: true });
      return;
    }
    setLoading(true);
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
      setProfile(p);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    void load();
  }, [load]);

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

  const addresses = profile?.addresses ?? [];

  return (
    <div className="mobile-page bg-background">
      <header className="sticky top-0 z-50 bg-[#F7F3FF] border-b border-violet-100/60 px-4 py-3 flex items-center gap-3">
        <Link
          to="/profile"
          className="w-9 h-9 rounded-full bg-white/90 border border-violet-100 flex items-center justify-center text-foreground"
        >
          <FaChevronLeft className="w-3.5 h-3.5" />
        </Link>
        <h1 className="text-base font-bold text-foreground">Saved Addresses</h1>
      </header>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-3 pb-24">
        {loading && (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-muted/40 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && addresses.length === 0 && (
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <FaMapMarkerAlt className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-base font-bold text-foreground">No addresses yet</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
              Add your delivery address — we can auto-fill it from GPS.
            </p>
            <Link
              to="/addresses/add"
              className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
            >
              <FaPlus className="w-3.5 h-3.5" />
              Add address
            </Link>
          </div>
        )}

        {!loading &&
          addresses.map((addr) => (
            <div
              key={addr.id ?? `${addr.line1}-${addr.pincode}`}
              className="bg-card rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  {typeIcons[addr.label] || <FaMapMarkerAlt className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-foreground">{addr.label}</span>
                    {addr.defaultAddress && (
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {addr.line1}
                    {addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}
                    {addr.state ? `, ${addr.state}` : ""} — {addr.pincode}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!addr.defaultAddress && (
                    <button
                      type="button"
                      className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-primary"
                      onClick={() => void onSetDefault(addr.id)}
                      aria-label="Set as default"
                    >
                      <FaStar className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-destructive"
                    onClick={() => void onDelete(addr.id)}
                    aria-label="Delete address"
                  >
                    <FaTrash className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

        {!loading && addresses.length > 0 && (
          <Link
            to="/addresses/add"
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-primary/30 text-primary text-sm font-semibold bg-primary/5 active:scale-[0.99] transition-transform"
          >
            <FaPlus className="w-4 h-4" />
            Add new address
          </Link>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Addresses;
