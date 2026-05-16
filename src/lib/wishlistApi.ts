import { apiGet, apiPost, apiDelete } from "@/lib/api";

export interface WishlistProduct {
  wishlistItemId: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  unit: string;
  storeCategory: string;
  badge: string | null;
  rating: number;
  available: boolean;
  restaurantId: string | null;
  addedAt: string;
}

export const wishlistKeys = {
  list: () => ["wishlist"] as const,
  ids: () => ["wishlist", "ids"] as const,
};

function normalizeWishlistItem(raw: Partial<WishlistProduct> & { productId: string }): WishlistProduct {
  return {
    wishlistItemId: raw.wishlistItemId ?? raw.productId,
    productId: raw.productId,
    name: raw.name ?? "Product",
    image: raw.image ?? "",
    price: Number(raw.price) || 0,
    originalPrice: Number(raw.originalPrice) || Number(raw.price) || 0,
    unit: raw.unit ?? "",
    storeCategory: raw.storeCategory ?? "food",
    badge: raw.badge ?? null,
    rating: Number(raw.rating) || 0,
    available: raw.available !== false,
    restaurantId: raw.restaurantId ?? null,
    addedAt: raw.addedAt ?? "",
  };
}

export async function fetchWishlist(): Promise<WishlistProduct[]> {
  const data = await apiGet<WishlistProduct[] | null>("/api/wishlist");
  if (!Array.isArray(data)) return [];
  return data.map((item) => normalizeWishlistItem(item));
}

export async function fetchWishlistIds(): Promise<string[]> {
  const data = await apiGet<string[] | Set<string> | null>("/api/wishlist/ids");
  if (Array.isArray(data)) return data;
  if (data instanceof Set) return [...data];
  return [];
}

export const toggleWishlist = (productId: string) =>
  apiPost<{ wishlisted: boolean; productId: string }>(`/api/wishlist/${productId}/toggle`, {});

export const removeFromWishlist = (productId: string) =>
  apiDelete(`/api/wishlist/${productId}`);
