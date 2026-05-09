import type { UserProfile } from "@/lib/userProfile";

export function isProfileComplete(p: UserProfile | null): boolean {
  if (!p) return false;
  return p.onboardingCompleted === true && !!(p.name?.trim());
}
