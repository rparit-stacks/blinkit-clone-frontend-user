import { publicPost } from "@/lib/api";
import type { StoreType } from "@/data/mockData";

const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined ?? "http://localhost:8080").replace(/\/+$/, "");

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  const json = await res.json() as { success: boolean; data: T };
  return json.data;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiCategory {
  id: string;   // slug e.g. "biryani"
  label: string;
  icon: string;
}

export interface ApiProduct {
  id: string;
  storeCategory: string;
  storeId: string;
  categorySlug: string;
  name: string;
  description: string | null;
  image: string;
  price: number;
  originalPrice: number;
  unit: string;
  badge: string | null;
  rating: number;
  available: boolean;
  restaurantId: string | null;
}

export interface ApiStore {
  id: string;
  storeCategory: string;
  name: string;
  description: string | null;
  image: string;
  coverImage: string | null;
  cuisineTypes: string | null;
  eta: string | null;
  rating: number | null;
  offer: string | null;
}

export interface ApiBanner {
  id: string;
  storeCategory: string;
  title: string;
  subtitle: string;
  code: string | null;
  imageUrl: string | null;
}

// ─── Query keys ──────────────────────────────────────────────────────────────

export const catalogKeys = {
  categories: (store: StoreType) => ["catalog", "categories", store] as const,
  products: (store: StoreType, cat?: string) => ["catalog", "products", store, cat ?? "all"] as const,
  product: (id: string) => ["catalog", "product", id] as const,
  stores: (store: StoreType) => ["catalog", "stores", store] as const,
  storeDetail: (id: string) => ["catalog", "store", id] as const,
  restaurantProducts: (restaurantId: string) => ["catalog", "restaurant-products", restaurantId] as const,
  banners: (store: StoreType) => ["catalog", "banners", store] as const,
  search: (store: StoreType, q: string) => ["catalog", "search", store, q] as const,
};

// ─── API functions ────────────────────────────────────────────────────────────

export async function fetchStoreCategories(store: StoreType): Promise<ApiCategory[]> {
  return get<ApiCategory[]>(`/api/catalog/${store}/categories`);
}

export async function fetchStoreProducts(store: StoreType, category?: string): Promise<ApiProduct[]> {
  const qs = category && category !== "all" ? `?cat=${encodeURIComponent(category)}` : "";
  return get<ApiProduct[]>(`/api/catalog/${store}/products${qs}`);
}

export async function fetchProductById(id: string): Promise<ApiProduct | null> {
  try {
    return await get<ApiProduct>(`/api/catalog/products/${id}`);
  } catch {
    return null;
  }
}

export async function fetchStores(store: StoreType): Promise<ApiStore[]> {
  return get<ApiStore[]>(`/api/catalog/${store}/stores`);
}

export async function fetchStoreById(id: string): Promise<ApiStore | null> {
  try {
    return await get<ApiStore>(`/api/catalog/stores/${id}`);
  } catch {
    return null;
  }
}

export async function fetchRestaurantProducts(restaurantId: string): Promise<ApiProduct[]> {
  return get<ApiProduct[]>(`/api/catalog/restaurants/${restaurantId}/products`);
}

export async function fetchStoreBanners(store: StoreType): Promise<ApiBanner[]> {
  return get<ApiBanner[]>(`/api/catalog/${store}/banners`);
}

export async function searchProducts(store: StoreType, q: string): Promise<ApiProduct[]> {
  if (!q.trim()) return [];
  return get<ApiProduct[]>(`/api/catalog/${store}/products/search?q=${encodeURIComponent(q)}`);
}
