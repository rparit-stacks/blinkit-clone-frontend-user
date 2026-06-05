import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FaArrowLeft } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { publicPost, setTokens } from "@/lib/api";
import { initPushNotifications } from "@/lib/pushNotifications";
import { navigateAfterLogin } from "@/lib/postLogin";
import { loadGsiScript } from "@/lib/googleGsi";
import { haptic } from "@/lib/haptics";

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
  const [gsiReady, setGsiReady] = useState(false);
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
    haptic(12, "medium");
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
    haptic(15, "confirm");
    setBusy(true);
    try {
      const data = await publicPost<AuthData>("/api/auth/email/verify-otp", {
        email: email.trim(),
        otp: otp.trim(),
      });
      setTokens(data.accessToken, data.refreshToken);
      void initPushNotifications();
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
      void initPushNotifications();
      toast.success("Signed in with Google!");
      await navigateAfterLogin(navigate);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Google sign-in failed");
    } finally {
      setBusy(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID.trim()) return;
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
        setGsiReady(true);
      } catch {
        // GSI not available
      }
    })();
    return () => {
      cancelled = true;
      try { window.google?.accounts?.id.cancel(); } catch { /* ignore */ }
    };
  }, [handleGoogleCredential]);

  // Render the native Google button when GSI is ready (only on email step)
  useEffect(() => {
    if (!gsiReady || step !== "email" || !gsiHostRef.current) return;
    const el = gsiHostRef.current;
    try {
      el.innerHTML = "";
      window.google?.accounts?.id.renderButton(el, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
        width: 320,
        shape: "pill",
      });
    } catch {
      /* ignore */
    }
    return () => { el.innerHTML = ""; };
  }, [gsiReady, step]);

  const googleConfigured = !!GOOGLE_CLIENT_ID.trim();

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col">
      {/* Top bar — back button only */}
      <div className="flex items-center px-4 pt-4 pb-2">
        <Link
          to="/"
          aria-label="Back"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 active:scale-95 transition-transform"
        >
          <FaArrowLeft className="w-4 h-4 text-gray-700" />
        </Link>
      </div>

      <div className="flex-1 flex flex-col px-6 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] max-w-md mx-auto w-full">
        {step === "email" ? (
          <>
            <div className="mb-8">
              <h1 className="text-[26px] font-extrabold leading-tight text-foreground">
                Welcome to{" "}
                <span className="text-primary">NainiStore</span>
              </h1>
              <p className="mt-2 text-[14px] text-muted-foreground leading-snug">
                Sign in or sign up with your email to start ordering.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="relative">
                <Input
                  id="auth-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 rounded-2xl border-gray-200 bg-gray-50 px-4 text-[15px] placeholder:text-gray-400 focus-visible:ring-primary"
                  onKeyDown={(e) => e.key === "Enter" && void handleSendOtp()}
                  autoFocus
                />
              </div>

              <Button
                type="button"
                className="h-14 w-full rounded-2xl text-[15px] font-bold shadow-[0_8px_24px_rgba(75,0,130,0.25)]"
                onClick={() => void handleSendOtp()}
                disabled={busy || !email.trim()}
              >
                {busy ? "Sending OTP…" : "Continue"}
              </Button>
            </div>

            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {googleConfigured && gsiReady ? (
              <div className="flex w-full justify-center">
                <div
                  ref={gsiHostRef}
                  className="flex min-h-[48px] w-full max-w-[320px] items-center justify-center [&>div]:!w-full [&>iframe]:!max-w-full"
                />
              </div>
            ) : (
              <button
                type="button"
                disabled={!googleConfigured || busy}
                onClick={() => {
                  if (!googleConfigured) {
                    toast.info("Google sign-in is not configured yet. Please use email OTP.");
                    return;
                  }
                  toast.loading("Loading Google…", { id: "gsi" });
                }}
                className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white text-[15px] font-semibold text-foreground shadow-sm active:scale-[0.99] transition-transform disabled:opacity-60"
              >
                <FcGoogle className="w-5 h-5" />
                <span>Continue with Google</span>
              </button>
            )}

            <p className="mt-auto pt-8 text-center text-[11px] text-muted-foreground leading-relaxed">
              By continuing, you agree to our{" "}
              <span className="text-foreground font-medium">Terms</span> &{" "}
              <span className="text-foreground font-medium">Privacy Policy</span>.
            </p>
          </>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-[24px] font-extrabold leading-tight text-foreground">
                Verify your email
              </h1>
              <p className="mt-2 text-[14px] text-muted-foreground leading-snug">
                We sent a 6-digit code to{" "}
                <span className="font-semibold text-foreground">{email}</span>
              </p>
            </div>

            <Input
              id="auth-otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="••••••"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="h-16 rounded-2xl border-gray-200 bg-gray-50 text-center text-[24px] font-bold tracking-[0.5em] placeholder:text-gray-300 focus-visible:ring-primary"
              onKeyDown={(e) => e.key === "Enter" && void handleVerifyOtp()}
              autoFocus
            />

            <Button
              type="button"
              className="mt-4 h-14 w-full rounded-2xl text-[15px] font-bold shadow-[0_8px_24px_rgba(75,0,130,0.25)]"
              onClick={() => void handleVerifyOtp()}
              disabled={busy || otp.length !== 6}
            >
              {busy ? "Verifying…" : "Verify & Continue"}
            </Button>

            <div className="mt-5 flex items-center justify-between text-[13px]">
              <button
                type="button"
                className="text-muted-foreground font-medium active:text-foreground"
                onClick={() => { setStep("email"); setOtp(""); }}
              >
                Change email
              </button>
              {countdown > 0 ? (
                <span className="text-muted-foreground">
                  Resend in <span className="font-semibold text-foreground">{countdown}s</span>
                </span>
              ) : (
                <button
                  type="button"
                  className="text-primary font-semibold active:opacity-70"
                  onClick={() => void handleSendOtp()}
                  disabled={busy}
                >
                  Resend OTP
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Auth;
