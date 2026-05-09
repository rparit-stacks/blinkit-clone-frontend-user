import { useCallback, useEffect, useState } from "react";
import {
  FaChevronLeft, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt,
  FaChevronRight, FaClipboardList, FaHeart, FaBell, FaSignOutAlt, FaEdit,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import BottomNav from "@/components/customer/BottomNav";
import { clearAccessToken, getAccessToken } from "@/lib/api";
import type { UserProfile } from "@/lib/userProfile";
import { fetchMyProfile } from "@/lib/userProfile";

const menuItems = [
  { icon: FaClipboardList, label: "My Orders", path: "/store/food/orders" },
  { icon: FaMapMarkerAlt, label: "Saved Addresses", path: "/addresses" },
  { icon: FaHeart, label: "Wishlist", path: "#" },
  { icon: FaBell, label: "Notifications", path: "/notifications" },
];

const Profile = () => {
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
      const msg = e instanceof Error ? e.message : "Could not load profile";
      if (msg.includes("401") || msg.includes("403")) {
        clearAccessToken();
        navigate("/auth", { replace: true });
        return;
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { void load(); }, [load]);

  const logout = () => {
    clearAccessToken();
    navigate("/auth", { replace: true });
    toast.success("Signed out");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-50 bg-[#F7F3FF] border-b border-violet-100/60 px-4 py-3 flex items-center gap-3">
        <Link to="/" className="w-9 h-9 rounded-full bg-white/90 border border-violet-100 flex items-center justify-center text-foreground">
          <FaChevronLeft className="w-3.5 h-3.5" />
        </Link>
        <h1 className="text-base font-bold text-foreground">My Profile</h1>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {loading && <p className="text-sm text-muted-foreground">Loading profile…</p>}
        {!loading && profile && (
          <>
            {/* User card */}
            <div className="bg-card rounded-card shadow-card p-5 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                {profile.profileImage ? (
                  <img src={profile.profileImage} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <FaUser className="w-7 h-7 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-foreground truncate">{profile.name || "—"}</h2>
                <p className="text-sm text-muted-foreground flex items-center gap-1 truncate">
                  <FaEnvelope className="w-3 h-3 shrink-0" /> {profile.email || "—"}
                </p>
                {profile.phone && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <FaPhone className="w-3 h-3 shrink-0" /> {profile.phone}
                  </p>
                )}
                {(profile.dateOfBirth || profile.gender) && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {profile.dateOfBirth ? String(profile.dateOfBirth).slice(0, 10) : ""}
                    {profile.dateOfBirth && profile.gender ? " · " : ""}
                    {profile.gender || ""}
                  </p>
                )}
              </div>
              <button
                type="button"
                className="p-2 text-primary shrink-0 rounded-full hover:bg-primary/10 transition-colors"
                aria-label="Edit profile"
                onClick={() => navigate("/profile/edit")}
              >
                <FaEdit className="w-4 h-4" />
              </button>
            </div>

            {/* Menu */}
            <div className="bg-card rounded-card shadow-card overflow-hidden">
              {menuItems.map((item, i) => (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3.5 hover:bg-muted transition-colors ${i < menuItems.length - 1 ? "border-b border-border" : ""}`}
                >
                  <item.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground flex-1">{item.label}</span>
                  <FaChevronRight className="w-3 h-3 text-muted-foreground" />
                </Link>
              ))}
            </div>

            {/* Addresses preview */}
            {profile.addresses.length > 0 && (
              <div className="bg-card rounded-card shadow-card p-4">
                <h3 className="text-sm font-bold text-foreground mb-3">Saved Addresses</h3>
                <div className="space-y-2">
                  {profile.addresses.slice(0, 3).map((addr) => (
                    <div key={addr.id ?? addr.line1} className="p-3 bg-muted rounded-button">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">{addr.label}</span>
                        {addr.defaultAddress && (
                          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-pill">Default</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}
                        {addr.state ? `, ${addr.state}` : ""} {addr.pincode}
                      </p>
                    </div>
                  ))}
                </div>
                <Link to="/addresses" className="text-sm text-primary font-medium mt-3 inline-block">
                  Manage addresses →
                </Link>
              </div>
            )}
          </>
        )}

        <button
          type="button"
          className="w-full bg-card rounded-card shadow-card p-4 flex items-center gap-3 text-destructive hover:bg-destructive/5 transition-colors"
          onClick={logout}
        >
          <FaSignOutAlt className="w-4 h-4" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
