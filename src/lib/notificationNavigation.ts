/** Resolve in-app route from FCM / push data payload. */
export function resolveNotificationPath(data: Record<string, string | undefined>): string {
  const clickUrl = data.clickUrl;
  if (clickUrl && clickUrl.startsWith("/")) return clickUrl;

  const kind = data.relatedEntityKind ?? data.entityKind ?? "";
  const id = data.relatedEntityId ?? data.entityId ?? "";
  if (kind === "ORDER" && id) return `/order-tracking/${id}`;
  if (kind === "SUB_ORDER" && id) return `/orders`;
  if (kind === "DELIVERY_ASSIGNMENT" && id) return `/orders`;
  return "/notifications";
}

export function dispatchNotificationNavigate(path: string): void {
  window.dispatchEvent(
    new CustomEvent("naini-notification-navigate", { detail: { path } })
  );
}
