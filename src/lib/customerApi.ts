import type { StoreType } from "@/data/mockData";
import { fetchStores, fetchStoreById, fetchStoreBanners, type ApiStore, type ApiBanner } from "@/lib/catalogApi";
import { pastOrders } from "@/data/mockData";

// Re-export types that callers use
export type { ApiStore as Restaurant, ApiBanner as Banner };

export type Order = {
  id: string;
  date: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  status: "delivered" | "processing" | "cancelled" | "on_the_way";
  store: StoreType;
};

// ─── Query keys ──────────────────────────────────────────────────────────────

export const customerKeys = {
  restaurants: (store?: StoreType) => ["customer", "restaurants", store ?? "all"] as const,
  restaurant: (id: string) => ["customer", "restaurant", id] as const,
  banners: (store: StoreType) => ["catalog", "banners", store] as const,
  orders: (store?: StoreType) => ["customer", "orders", store ?? "all"] as const,
  orderDetail: (id: string) => ["customer", "order", id] as const,
  delivery: (id: string) => ["customer", "delivery", id] as const,
  notifications: () => ["customer", "notifications"] as const,
};

// ─── Stores / Restaurants ─────────────────────────────────────────────────────

export async function fetchRestaurants(store?: StoreType): Promise<ApiStore[]> {
  return fetchStores(store ?? "food");
}

export async function fetchRestaurantById(id: string): Promise<ApiStore | null> {
  return fetchStoreById(id);
}

// ─── Banners ─────────────────────────────────────────────────────────────────

export async function fetchBanners(store: StoreType): Promise<ApiBanner[]> {
  return fetchStoreBanners(store);
}

// ─── Orders (local for now — orders backend comes in next phase) ─────────────

export type OrderLineInput = { productId: string; quantity: number };

export type CreateOrderBody = {
  store: StoreType;
  addressId?: string;
  addressSnapshotJson: string;
  paymentMode: "cod" | "online";
  lines: OrderLineInput[];
};

export type CreateOrderResult = {
  orderId: string;
  status: string;
  paymentHint?: unknown;
};

let _orderCounter = 1000;

export async function createOrder(body: CreateOrderBody): Promise<CreateOrderResult> {
  const orderId = `LOCAL-${++_orderCounter}`;
  const stored = JSON.parse(localStorage.getItem("localOrders") ?? "[]") as Order[];
  const newOrder: Order = {
    id: orderId,
    date: new Date().toISOString().slice(0, 10),
    items: body.lines.map((l) => ({ name: l.productId, qty: l.quantity, price: 0 })),
    total: 0,
    status: "processing",
    store: body.store,
  };
  stored.push(newOrder);
  localStorage.setItem("localOrders", JSON.stringify(stored));
  return { orderId, status: "processing" };
}

export async function fetchMyOrders(store?: StoreType): Promise<Order[]> {
  const stored = JSON.parse(localStorage.getItem("localOrders") ?? "[]") as Order[];
  const all = [...pastOrders, ...stored];
  return store ? all.filter((o) => o.store === store) : all;
}

export type TimelineStep = { label: string; done: boolean; current: boolean };

export type OrderDetail = Order & {
  timeline: TimelineStep[];
  etaMinutes: number | null;
};

export async function fetchOrderDetail(orderId: string): Promise<OrderDetail | null> {
  const stored = JSON.parse(localStorage.getItem("localOrders") ?? "[]") as Order[];
  const all = [...pastOrders, ...stored];
  const order = all.find((o) => o.id === orderId);
  if (!order) return null;
  const timeline: TimelineStep[] = [
    { label: "Placed", done: true, current: false },
    { label: "Confirmed", done: order.status !== "processing", current: order.status === "processing" },
    { label: "Picked", done: order.status === "on_the_way" || order.status === "delivered", current: false },
    { label: "On the way", done: order.status === "delivered", current: order.status === "on_the_way" },
    { label: "Delivered", done: order.status === "delivered", current: false },
  ];
  return { ...order, timeline, etaMinutes: order.status === "on_the_way" ? 15 : null };
}

export type PaymentInitiateResult = {
  keyId: string;
  orderId: string;
  amountPaise: number;
  currency: string;
  provider: string;
};

export async function initiatePayment(orderId: string): Promise<PaymentInitiateResult> {
  return { keyId: "stub_key", orderId, amountPaise: 50000, currency: "INR", provider: "stub" };
}

export async function verifyPayment(_payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): Promise<void> {
  // stub — always succeeds
}

export type { NotificationItem } from "@/lib/notificationsApi";
export {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/notificationsApi";

export type DeliveryStatus = { orderId: string; status: string; etaMinutes: number | null };

export async function fetchDeliveryStatus(orderId: string): Promise<DeliveryStatus | null> {
  return { orderId, status: "processing", etaMinutes: null };
}
