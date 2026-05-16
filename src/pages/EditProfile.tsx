import { useCallback, useEffect, useState } from "react";
import { FaChevronLeft, FaEnvelope, FaMapMarkerAlt, FaPhone, FaUser } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import BottomNav from "@/components/customer/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clearAccessToken, getAccessToken } from "@/lib/api";
import type { AddressPayload } from "@/lib/userProfile";
import { fetchMyProfile, upsertMyProfile } from "@/lib/userProfile";

const EditProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [addresses, setAddresses] = useState<AddressPayload[]>([]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");

  const load = useCallback(async () => {
    if (!getAccessToken()) { navigate("/auth", { replace: true }); return; }
    setLoading(true);
    try {
      const p = await fetchMyProfile();
      if (!p) { clearAccessToken(); navigate("/auth", { replace: true }); return; }
      if (!p.onboardingCompleted) { navigate("/onboarding", { replace: true }); return; }
      setFullName(p.name || "");
      setEmail(p.email || "");
      setPhone(p.phone || "");
      setDateOfBirth(p.dateOfBirth ? String(p.dateOfBirth).slice(0, 10) : "");
      setGender(p.gender || "");
      setAddresses(p.addresses ?? []);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not load profile";
      if (msg.includes("401") || msg.includes("403")) { clearAccessToken(); navigate("/auth", { replace: true }); return; }
      toast.error(msg);
      navigate("/profile", { replace: true });
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { void load(); }, [load]);

  const onSave = async () => {
    if (!fullName.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      await upsertMyProfile({
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
        gender: gender || undefined,
        dateOfBirth: dateOfBirth || undefined,
      });
      toast.success("Profile updated");
      navigate("/profile", { replace: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mobile-page bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="sticky top-0 z-50 bg-[#F7F3FF] border-b border-violet-100/60 px-4 py-3 flex items-center gap-3">
        <Link to="/profile" className="w-9 h-9 rounded-full bg-white/90 border border-violet-100 flex items-center justify-center text-foreground" aria-label="Back">
          <FaChevronLeft className="w-3.5 h-3.5" />
        </Link>
        <div>
          <h1 className="text-base font-bold text-foreground leading-tight">Edit profile</h1>
          <p className="text-[11px] text-muted-foreground">Update your details</p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-6">
        {/* Personal info */}
        <section className="bg-card rounded-card shadow-card p-5 space-y-4 border border-violet-100/40">
          <div className="flex items-center gap-2 text-sm font-bold text-foreground">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <FaUser className="w-3.5 h-3.5" />
            </span>
            Personal
          </div>
          <div className="space-y-3">
            <div>
              <Label htmlFor="ep-fullName">Full name</Label>
              <Input id="ep-fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1.5 rounded-xl" autoComplete="name" />
            </div>
            <div>
              <Label htmlFor="ep-email" className="flex items-center gap-1.5">
                <FaEnvelope className="w-3 h-3 text-muted-foreground" /> Email
                <span className="ml-auto text-[10px] text-muted-foreground font-normal">read-only</span>
              </Label>
              <Input id="ep-email" type="email" value={email} readOnly disabled className="mt-1.5 rounded-xl opacity-60 cursor-not-allowed" />
            </div>
            <div>
              <Label htmlFor="ep-phone" className="flex items-center gap-1.5">
                <FaPhone className="w-3 h-3 text-muted-foreground" /> Phone
              </Label>
              <Input id="ep-phone" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1.5 rounded-xl" placeholder="+91 98765 43210" />
            </div>
            <div>
              <Label htmlFor="ep-dob">Date of birth (optional)</Label>
              <Input id="ep-dob" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="mt-1.5 rounded-xl" />
            </div>
            <div>
              <Label htmlFor="ep-gender">Gender (optional)</Label>
              <select
                id="ep-gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="mt-1.5 w-full h-11 rounded-xl border border-input bg-background px-3 text-sm"
              >
                <option value="">Prefer not to say</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </section>

        {/* Addresses */}
        <section className="bg-card rounded-card shadow-card p-5 space-y-3 border border-violet-100/40">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-bold text-foreground">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <FaMapMarkerAlt className="w-3.5 h-3.5" />
              </span>
              Addresses
            </div>
            <Link to="/addresses" className="text-xs font-semibold text-primary hover:underline">Manage →</Link>
          </div>
          {addresses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No addresses saved yet.</p>
          ) : (
            <ul className="space-y-2">
              {addresses.map((a) => (
                <li key={a.id ?? `${a.line1}-${a.pincode}`} className="rounded-xl border border-border bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{a.label}</span>
                  {a.defaultAddress && (
                    <span className="ml-2 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-pill">Default</span>
                  )}
                  <p className="mt-1">{a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city}{a.state ? `, ${a.state}` : ""} {a.pincode}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" className="rounded-xl" onClick={() => navigate("/profile")} disabled={saving}>Cancel</Button>
          <Button type="button" className="rounded-xl font-semibold" onClick={() => void onSave()} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default EditProfile;
