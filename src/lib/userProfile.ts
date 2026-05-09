import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";

export type AddressPayload = {
  id?: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  pincode: string;
  defaultAddress: boolean;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  profileImage: string | null;
  onboardingCompleted: boolean;
  gender?: string;
  dateOfBirth?: string | null;
  role: string;
  createdAt?: string;
  updatedAt?: string;
  // aliases used by UI
  fullName: string;
  alternatePhone: string;
  addresses: AddressPayload[];
};

type BackendUser = {
  id: string;
  name?: string;
  email: string;
  phone?: string;
  profileImage?: string | null;
  onboardingCompleted: boolean;
  gender?: string;
  dateOfBirth?: string | null;
  role: string;
  createdAt?: string;
  updatedAt?: string;
};

type ProfileResponse = {
  user: BackendUser;
  addresses: AddressPayload[];
};

function normalizeUser(u: BackendUser, addresses: AddressPayload[]): UserProfile {
  return {
    id: u.id,
    name: u.name ?? "",
    email: u.email ?? "",
    phone: u.phone ?? "",
    profileImage: u.profileImage ?? null,
    onboardingCompleted: u.onboardingCompleted,
    gender: u.gender ?? "",
    dateOfBirth: u.dateOfBirth ?? null,
    role: u.role ?? "CUSTOMER",
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
    fullName: u.name ?? "",
    alternatePhone: "",
    addresses,
  };
}

export async function fetchMyProfile(): Promise<UserProfile | null> {
  try {
    const data = await apiGet<ProfileResponse>("/api/user/profile");
    return normalizeUser(data.user, data.addresses ?? []);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("401") || msg.includes("403") || msg.includes("Unauthorized")) return null;
    throw e;
  }
}

export type UserProfileUpsert = {
  name?: string;
  fullName?: string;
  phone?: string;
  profileImage?: string;
  gender?: string;
  dateOfBirth?: string | null;
};

export async function upsertMyProfile(body: UserProfileUpsert): Promise<UserProfile> {
  const payload = {
    name: body.fullName ?? body.name,
    phone: body.phone,
    profileImage: body.profileImage,
    gender: body.gender,
    dateOfBirth: body.dateOfBirth,
  };
  const user = await apiPut<BackendUser>("/api/user/profile", payload);
  const addresses = await apiGet<AddressPayload[]>("/api/user/addresses");
  return normalizeUser(user, addresses ?? []);
}

export async function addMyAddress(addr: Omit<AddressPayload, "id">): Promise<UserProfile> {
  await apiPost<AddressPayload>("/api/user/addresses", addr);
  return fetchMyProfile() as Promise<UserProfile>;
}

export async function updateMyAddress(id: string, addr: AddressPayload): Promise<UserProfile> {
  await apiPut<AddressPayload>(`/api/user/addresses/${id}`, addr);
  return fetchMyProfile() as Promise<UserProfile>;
}

export async function deleteMyAddress(id: string): Promise<UserProfile> {
  await apiDelete(`/api/user/addresses/${id}`);
  return fetchMyProfile() as Promise<UserProfile>;
}

export async function setDefaultAddress(id: string): Promise<UserProfile> {
  await apiPut<AddressPayload>(`/api/user/addresses/${id}/default`, {});
  return fetchMyProfile() as Promise<UserProfile>;
}
