const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined ?? "http://localhost:8080").replace(/\/+$/, "");

export function buildUrl(path: string): string {
  return `${BASE}${path}`;
}

export function getAccessToken(): string | null {
  return localStorage.getItem("accessToken");
}

export function setAccessToken(token: string): void {
  localStorage.setItem("accessToken", token);
}

export function clearAccessToken(): void {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

export function getRefreshToken(): string | null {
  return localStorage.getItem("refreshToken");
}

export function setTokens(access: string, refresh: string): void {
  localStorage.setItem("accessToken", access);
  localStorage.setItem("refreshToken", refresh);
}

export function authHeaders(json = false): Record<string, string> {
  const token = getAccessToken();
  const h: Record<string, string> = { Accept: "application/json" };
  if (token) h["Authorization"] = `Bearer ${token}`;
  if (json) h["Content-Type"] = "application/json";
  return h;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(buildUrl(path), { headers: authHeaders() });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(t || `Request failed (${res.status})`);
  }
  const json = await res.json() as { success: boolean; data: T; message?: string };
  return json.data;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(buildUrl(path), {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let msg = text;
    try { msg = (JSON.parse(text) as { message?: string }).message ?? text; } catch { /* raw */ }
    throw new Error(msg || `Request failed (${res.status})`);
  }
  const json = await res.json() as { success: boolean; data: T; message?: string };
  return json.data;
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(buildUrl(path), {
    method: "PUT",
    headers: authHeaders(true),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let msg = text;
    try { msg = (JSON.parse(text) as { message?: string }).message ?? text; } catch { /* raw */ }
    throw new Error(msg || `Request failed (${res.status})`);
  }
  const json = await res.json() as { success: boolean; data: T; message?: string };
  return json.data;
}

export async function apiDelete(path: string): Promise<void> {
  const res = await fetch(buildUrl(path), {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let msg = text;
    try { msg = (JSON.parse(text) as { message?: string }).message ?? text; } catch { /* raw */ }
    throw new Error(msg || `Request failed (${res.status})`);
  }
}

/** Public POST — no Authorization header (used for auth endpoints) */
export async function publicPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(buildUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let msg = text;
    try { msg = (JSON.parse(text) as { message?: string }).message ?? text; } catch { /* raw */ }
    throw new Error(msg || `Request failed (${res.status})`);
  }
  const json = await res.json() as { success: boolean; data: T; message?: string };
  return json.data;
}
