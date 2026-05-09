import type { NavigateFunction } from "react-router-dom";
import { fetchMyProfile } from "@/lib/userProfile";

export async function navigateAfterLogin(navigate: NavigateFunction) {
  try {
    const profile = await fetchMyProfile();
    if (profile?.onboardingCompleted) {
      navigate("/", { replace: true });
    } else {
      navigate("/onboarding", { replace: true });
    }
  } catch {
    navigate("/onboarding", { replace: true });
  }
}
