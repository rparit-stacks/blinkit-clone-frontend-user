import { apiGet } from "@/lib/api";

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  time: string;
  type?: string;
  relatedEntityKind?: string;
  relatedEntityId?: string;
};

const READ_KEY = "notifications-read:customer";

function getReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(READ_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveReadIds(ids: Set<string>) {
  localStorage.setItem(READ_KEY, JSON.stringify([...ids]));
}

type FeedResponse = {
  items: Array<{
    id: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
    time: string;
    type?: string;
    relatedEntityKind?: string;
    relatedEntityId?: string;
  }>;
};

export async function fetchNotifications(): Promise<NotificationItem[]> {
  const data = await apiGet<FeedResponse>("/api/notifications?limit=50");
  const readIds = getReadIds();
  return (data.items ?? []).map((n) => ({
    ...n,
    read: readIds.has(n.id) || n.read,
  }));
}

export async function markNotificationRead(id: string): Promise<void> {
  const ids = getReadIds();
  ids.add(id);
  saveReadIds(ids);
}

export async function markAllNotificationsRead(): Promise<void> {
  const items = await fetchNotifications();
  saveReadIds(new Set(items.map((n) => n.id)));
}
