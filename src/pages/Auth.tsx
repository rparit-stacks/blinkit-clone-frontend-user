import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthHeroIllustration } from "@/components/auth/AuthHeroIllustration";
import { publicPost, setTokens } from "@/lib/api";
import { navigateAfterLogin } from "@/lib/postLogin";
import { loadGsiScript } from "@/lib/googleGsi";

type AuthStep = "email" | "otp";

type SendOtpData = { message: string; otp?: string };
type AuthData = { accessToken: string; refreshToken: string; isNewUser: boolean };

const GOOGLE_CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) ?? "";

const Auth = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<AuthStep>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const gsiHostRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCountdown = () => {
    setCountdown(60);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const handleSendOtp = async () => {
    if (!email.trim() || !email.includes("@")) {
      toast.error("Enter a valid email address");
      return;
    }
    setBusy(true);
    try {
      const data = await publicPost<SendOtpData>("/api/auth/email/send-otp", { email: email.trim() });
      setStep("otp");
      startCountdown();
      if (data.otp) {
        toast.info(`Dev mode — OTP: ${data.otp}`, { duration: 30000 });
      } else {
        toast.success("OTP sent to your email");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send OTP");
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.trim().length !== 6) {
      toast.error("Enter the 6-digit OTP");
      return;
    }
    setBusy(true);
    try {
      const data = await publicPost<AuthData>("/api/auth/email/verify-otp", {
        email: email.trim(),
        otp: otp.trim(),
      });
      setTokens(data.accessToken, data.refreshToken);
      toast.success("Signed in successfully!");
      await navigateAfterLogin(navigate);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Invalid OTP");
    } finally {
      setBusy(false);
    }
  };

  const handleGoogleCredential = useCallback(async (credential: string) => {
    setBusy(true);
    try {
      const data = await publicPost<AuthData>("/api/auth/google", { idToken: credential });
      setTokens(data.accessToken, data.refreshToken);
      toast.success("Signed in with Google!");
      await navigateAfterLogin(navigate);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Google sign-in failed");
    } finally {
      setBusy(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID.trim() || !gsiHostRef.current) return;
    const el = gsiHostRef.current;
    let cancelled = false;
    (async () => {
      try {
        await loadGsiScript();
        if (cancelled || !window.google?.accounts?.id) return;
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID.trim(),
          callback: (resp) => { if (resp?.credential) void handleGoogleCredential(resp.credential); },
          auto_select: false,
        });
        el.innerHTML = "";
        window.google.accounts.id.renderButton(el, {
          type: "standard", theme: "filled_blue", size: "large",
          text: "signin_with", width: 320, shape: "pill",
        });
      } catch { /* GSI not available */ }
    })();
    return () => {
      cancelled = true;
      try { window.google?.accounts?.id.cancel(); } catch { /* ignore */ }
      el.innerHTML = "";
    };
  }, [handleGoogleCredential]);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background max-w-lg mx-auto w-full shadow-[0_0_0_1px_hsl(var(--border))] md:my-4 md:min-h-[calc(100dvh-2rem)] md:rounded-modal md:overflow-hidden">
      {/* Hero */}
      <div className="relative h-[45dvh] min-h-[220px] shrink-0 overflow-hidden bg-[#5b21b6]">
        <AuthHeroIllustration className="absolute inset-0 h-full w-full min-h-[220px]" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/25 to-[#4c1d95]/35" aria-hidden />
        <div className="absolute inset-0 flex flex-col justify-between p-5 pt-[max(1.25rem,env(safe-area-inset-top))]">
          <Link
            to="/"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md ring-1 ring-white/30 hover:bg-white/30 transition-colors w-fit"
            aria-label="Home"
          >
            <span className="text-lg leading-none">←</span>
          </Link>
          <div className="rounded-2xl border border-white/20 bg-gradient-to-br from-white/15 to-white/5 px-4 py-3 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.15)]">
            <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-sm">NaniStore</h1>
            <p className="mt-1 text-sm text-white/95">
              {step === "email" ? "Sign in to continue" : `OTP sent to ${email}`}
            </p>
          </div>
        </div>
      </div>

      {/* Form card */}
      <div className="relative flex flex-1 flex-col rounded-t-[28px] bg-card px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-8 shadow-[0_-8px_32px_rgba(0,0,0,0.08)] -mt-5 z-10">

        {step === "email" ? (
          <>
            <h2 className="text-lg font-semibold text-foreground">Welcome</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your email — we'll send you a one-time password.
            </p>

            <div className="mt-8 flex flex-col gap-4">
              <div>
                <Label htmlFor="auth-email">Email address</Label>
                <Input
                  id="auth-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 h-12"
                  onKeyDown={(e) => e.key === "Enter" && void handleSendOtp()}
                  autoFocus
                />
              </div>
              <Button
                type="button"
                className="h-12 w-full rounded-2xl text-base font-bold"
                onClick={() => void handleSendOtp()}
                disabled={busy}
              >
                {busy ? "Sending OTP…" : "Send OTP"}
              </Button>
            </div>

            {GOOGLE_CLIENT_ID.trim() && (
              <>
                <div className="my-6 flex items-center gap-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground">or</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="flex min-h-[48px] w-full max-w-[320px] mx-auto items-center justify-center">
                  <div
                    ref={gsiHostRef}
                    className="flex min-h-[48px] w-full max-w-[320px] items-center justify-center [&>iframe]:max-w-full"
                  />
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-foreground">Enter OTP</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Check <span className="font-medium text-foreground">{email}</span> for a 6-digit code.
            </p>

            <div className="mt-8 flex flex-col gap-4">
              <div>
                <Label htmlFor="auth-otp">6-digit OTP</Label>
                <Input
                  id="auth-otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="mt-1.5 h-12 tracking-[0.4em] text-center text-lg font-bold"
                  onKeyDown={(e) => e.key === "Enter" && void handleVerifyOtp()}
                  autoFocus
                />
              </div>

              <Button
                type="button"
                className="h-12 w-full rounded-2xl text-base font-bold"
                onClick={() => void handleVerifyOtp()}
                disabled={busy}
              >
                {busy ? "Verifying…" : "Verify OTP"}
              </Button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => { setStep("email"); setOtp(""); }}
                >
                  ← Change email
                </button>
                {countdown > 0 ? (
                  <span className="text-muted-foreground">Resend in {countdown}s</span>
                ) : (
                  <button
                    type="button"
                    className="text-primary font-medium"
                    onClick={() => void handleSendOtp()}
                    disabled={busy}
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Auth;
