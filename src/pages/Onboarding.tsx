import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FaSignOutAlt } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clearAccessToken, getAccessToken } from "@/lib/api";
import { fetchMyProfile, upsertMyProfile } from "@/lib/userProfile";

const Onboarding = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");

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
        if (p.name) setName(p.name);
        if (p.onboardingCompleted) {
          navigate("/", { replace: true });
          return;
        }
      } catch {
        // new user — continue showing form
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const logout = () => {
    clearAccessToken();
    toast.success("Signed out");
    navigate("/auth", { replace: true });
  };

  const onFinish = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      await upsertMyProfile({ fullName: name.trim() });
      toast.success("Welcome to NaniStore!");
      navigate("/", { replace: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background max-w-lg mx-auto w-full px-4 pt-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-foreground">Almost there!</h1>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2 text-destructive border-destructive/30"
          onClick={logout}
        >
          <FaSignOutAlt className="w-3.5 h-3.5" />
          Log out
        </Button>
      </div>

      <p className="text-sm text-muted-foreground mb-8">What should we call you?</p>

      <div className="space-y-5">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="mt-1.5 h-12"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && void onFinish()}
          />
        </div>
        <Button
          className="w-full mt-4 h-12 text-base font-semibold"
          onClick={() => void onFinish()}
          disabled={saving}
        >
          {saving ? "Saving…" : "Get Started"}
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;
