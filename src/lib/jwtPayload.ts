/** Decode JWT payload (no signature verification — for UI hints only). */
export type JwtPayloadShape = {
  sub?: string;
  email?: string;
  name?: string;
};

export function parseJwtPayload(token: string): JwtPayloadShape | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = JSON.parse(atob(b64));
    return typeof json === "object" && json !== null ? (json as JwtPayloadShape) : null;
  } catch {
    return null;
  }
}
