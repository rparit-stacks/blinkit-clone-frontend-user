import React, { createContext, useContext, useCallback, useMemo, useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchCart,
  upsertCartItem,
  clearCartApi,
  cartKeys,
  type CartDto,
  type CartItemDto,
} from "@/lib/cartApi";
import { getAccessToken } from "@/lib/api";
import type { ApiProduct } from "@/lib/catalogApi";
import { haptic } from "@/lib/haptics";

export type CartProductHint = Pick<
  ApiProduct,
  "id" | "name" | "image" | "price" | "originalPrice" | "unit" | "storeCategory" | "storeId" | "restaurantId"
>;

interface CartContextType {
  cart: CartDto | undefined;
  isLoading: boolean;
  addItem: (productId: string, currentQty: number, product?: CartProductHint) => void;
  removeItem: (productId: string, currentQty: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getQuantity: (productId: string) => number;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  restaurantConflict: null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function buildOptimisticCart(
  prev: CartDto | undefined,
  productId: string,
  quantity: number,
  product?: CartProductHint
): CartDto | undefined {
  const base = prev ?? { items: [], subtotal: 0, deliveryFee: 0, taxes: 0, total: 0, itemCount: 0 };
  let items = [...base.items];
  const idx = items.findIndex((i) => i.productId === productId);

  if (quantity <= 0) {
    items = items.filter((i) => i.productId !== productId);
  } else if (idx >= 0) {
    const item = items[idx];
    items[idx] = { ...item, quantity, lineTotal: item.price * quantity };
  } else if (product) {
    items.push({
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      storeCategory: product.storeCategory,
      storeId: product.storeId,
      restaurantId: product.restaurantId,
      price: product.price,
      originalPrice: product.originalPrice,
      unit: product.unit,
      quantity,
      lineTotal: product.price * quantity,
    });
  } else {
    return prev;
  }

  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);
  const deliveryFee = subtotal >= 500 ? 0 : 30;
  const taxes = Math.round(subtotal * 0.05);
  return {
    items,
    subtotal,
    deliveryFee,
    taxes,
    total: subtotal + deliveryFee + taxes,
    itemCount,
  };
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const qc = useQueryClient();
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!getAccessToken());

  useEffect(() => {
    const sync = () => setIsLoggedIn(!!getAccessToken());
    window.addEventListener("nani-auth-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("nani-auth-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const { data: cart, isLoading } = useQuery({
    queryKey: cartKeys.cart(),
    queryFn: fetchCart,
    enabled: isLoggedIn,
    staleTime: 30 * 1000,
  });

  const upsertMutation = useMutation({
    mutationFn: ({
      productId,
      quantity,
    }: {
      productId: string;
      quantity: number;
      product?: CartProductHint;
    }) => upsertCartItem(productId, quantity),
    onMutate: async ({ productId, quantity, product }) => {
      await qc.cancelQueries({ queryKey: cartKeys.cart() });
      const prev = qc.getQueryData<CartDto>(cartKeys.cart());
      const next = buildOptimisticCart(prev, productId, quantity, product);
      if (next) qc.setQueryData(cartKeys.cart(), next);
      return { prev };
    },
    onSuccess: (updated) => {
      qc.setQueryData(cartKeys.cart(), updated);
      window.dispatchEvent(new Event("nani-cart-updated"));
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev !== undefined) qc.setQueryData(cartKeys.cart(), ctx.prev);
      toast.error(err instanceof Error ? err.message : "Could not update cart");
    },
  });

  const clearMutation = useMutation({
    mutationFn: clearCartApi,
    onSuccess: (updated) => {
      qc.setQueryData(cartKeys.cart(), updated);
    },
  });

  const requireAuth = useCallback(() => {
    if (getAccessToken()) return true;
    toast.error("Please sign in to add items to cart");
    window.setTimeout(() => {
      window.location.assign("/auth");
    }, 400);
    return false;
  }, []);

  const getQuantity = useCallback(
    (productId: string) =>
      cart?.items.find((i: CartItemDto) => i.productId === productId)?.quantity ?? 0,
    [cart]
  );

  const addItem = useCallback(
    (productId: string, currentQty: number, product?: CartProductHint) => {
      if (!requireAuth()) return;
      haptic(10, "light");
      upsertMutation.mutate({ productId, quantity: currentQty + 1, product });
    },
    [requireAuth, upsertMutation]
  );

  const removeItem = useCallback(
    (productId: string, currentQty: number) => {
      if (!requireAuth()) return;
      haptic(10, "light");
      upsertMutation.mutate({ productId, quantity: Math.max(0, currentQty - 1) });
    },
    [requireAuth, upsertMutation]
  );

  const setQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (!requireAuth()) return;
      upsertMutation.mutate({ productId, quantity });
    },
    [requireAuth, upsertMutation]
  );

  const clearCart = useCallback(() => {
    if (!requireAuth()) return;
    clearMutation.mutate();
  }, [requireAuth, clearMutation]);

  const getTotalItems = useCallback(() => cart?.itemCount ?? 0, [cart]);
  const getTotalPrice = useCallback(() => cart?.subtotal ?? 0, [cart]);

  const value = useMemo(
    () => ({
      cart,
      isLoading,
      addItem,
      removeItem,
      setQuantity,
      clearCart,
      getQuantity,
      getTotalItems,
      getTotalPrice,
      restaurantConflict: null as null,
    }),
    [cart, isLoading, addItem, removeItem, setQuantity, clearCart, getQuantity, getTotalItems, getTotalPrice]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
