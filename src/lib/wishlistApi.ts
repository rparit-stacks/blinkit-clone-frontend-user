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
  ids:  () => ["wishlist", "ids"] as const,
};

export const fetchWishlist = () => apiGet<WishlistProduct[]>("/api/wishlist");
export const fetchWishlistIds = () => apiGet<string[]>("/api/wishlist/ids");
export const toggleWishlist = (productId: string) =>
  apiPost<{ wishlisted: boolean; productId: string }>(`/api/wishlist/${productId}/toggle`, {});
export const removeFromWishlist = (productId: string) =>
  apiDelete(`/api/wishlist/${productId}`);
