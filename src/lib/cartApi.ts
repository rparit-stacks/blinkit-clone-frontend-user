import { apiGet, apiPut, apiDelete, apiPost } from "@/lib/api";

export interface CartItemDto {
  productId: string;
  productName: string;
  productImage: string;
  storeCategory: string;
  storeId: string;
  restaurantId: string | null;
  price: number;
  originalPrice: number;
  unit: string;
  quantity: number;
  lineTotal: number;
}

export interface CartDto {
  items: CartItemDto[];
  subtotal: number;
  deliveryFee: number;
  taxes: number;
  total: number;
  itemCount: number;
}

export interface CreateOrderRequest {
  addressId?: string;
  addressSnapshotJson: string;
  paymentMode: "cod" | "razorpay";
  idempotencyKey: string;
  couponCode?: string;
}

export interface CreateOrderResponse {
  orderId: string;
  status: string;
  razorpayOrderId?: string;
  razorpayKeyId?: string;
  amountPaise?: number;
  currency?: string;
}

export interface OrderItemDto {
  productId: string;
  productName: string;
  productImage: string;
  storeCategory: string;
  storeId: string;
  price: number;
  quantity: number;
  lineTotal: number;
  unit: string;
}

export interface OrderDto {
  id: string;
  userId: string;
  items: OrderItemDto[];
  subtotal: number;
  deliveryFee: number;
  taxes: number;
  discount: number;
  total: number;
  addressSnapshot: string;
  paymentMode: string;
  razorpayOrderId: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentVerifyRequest {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

// ─── Cart API ─────────────────────────────────────────────────────────────────

export const cartKeys = {
  cart: () => ["cart"] as const,
};

export const orderKeys = {
  orders: () => ["orders"] as const,
  order: (id: string) => ["orders", id] as const,
};

export async function fetchCart(): Promise<CartDto> {
  return apiGet<CartDto>("/api/cart");
}

export async function upsertCartItem(productId: string, quantity: number): Promise<CartDto> {
  return apiPut<CartDto>("/api/cart/items", { productId, quantity });
}

export async function clearCartApi(): Promise<CartDto> {
  return apiDelete("/api/cart").then(() => fetchCart());
}

// ─── Order API ────────────────────────────────────────────────────────────────

export async function createOrder(req: CreateOrderRequest): Promise<CreateOrderResponse> {
  return apiPost<CreateOrderResponse>("/api/orders", req);
}

export async function verifyPayment(req: PaymentVerifyRequest): Promise<OrderDto> {
  return apiPost<OrderDto>("/api/orders/verify-payment", req);
}

export async function fetchMyOrders(): Promise<OrderDto[]> {
  return apiGet<OrderDto[]>("/api/orders");
}

export async function fetchOrderById(id: string): Promise<OrderDto> {
  return apiGet<OrderDto>(`/api/orders/${id}`);
}

export async function cancelOrder(id: string): Promise<OrderDto> {
  return apiPost<OrderDto>(`/api/orders/${id}/cancel`, {});
}
