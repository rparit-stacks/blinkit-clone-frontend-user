import React, { createContext, useContext, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchCart,
  upsertCartItem,
  clearCartApi,
  cartKeys,
  type CartDto,
  type CartItemDto,
} from "@/lib/cartApi";
import { getAccessToken } from "@/lib/api";

interface CartContextType {
  cart: CartDto | undefined;
  isLoading: boolean;
  addItem: (productId: string, currentQty: number) => void;
  removeItem: (productId: string, currentQty: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getQuantity: (productId: string) => number;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  // Legacy compat helpers used by FloatingCartBar / ProductCard
  restaurantConflict: null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const EMPTY_CART: CartDto = {
  items: [],
  subtotal: 0,
  deliveryFee: 0,
  taxes: 0,
  total: 0,
  itemCount: 0,
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const qc = useQueryClient();
  const isLoggedIn = !!getAccessToken();

  const { data: cart, isLoading } = useQuery({
    queryKey: cartKeys.cart(),
    queryFn: fetchCart,
    enabled: isLoggedIn,
    staleTime: 30 * 1000,
  });

  const upsertMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      upsertCartItem(productId, quantity),
    onSuccess: (updated) => {
      qc.setQueryData(cartKeys.cart(), updated);
    },
  });

  const clearMutation = useMutation({
    mutationFn: clearCartApi,
    onSuccess: (updated) => {
      qc.setQueryData(cartKeys.cart(), updated);
    },
  });

  const getQuantity = useCallback(
    (productId: string) =>
      cart?.items.find((i: CartItemDto) => i.productId === productId)?.quantity ?? 0,
    [cart]
  );

  const addItem = useCallback(
    (productId: string, currentQty: number) => {
      upsertMutation.mutate({ productId, quantity: currentQty + 1 });
    },
    [upsertMutation]
  );

  const removeItem = useCallback(
    (productId: string, currentQty: number) => {
      upsertMutation.mutate({ productId, quantity: Math.max(0, currentQty - 1) });
    },
    [upsertMutation]
  );

  const setQuantity = useCallback(
    (productId: string, quantity: number) => {
      upsertMutation.mutate({ productId, quantity });
    },
    [upsertMutation]
  );

  const clearCart = useCallback(() => {
    clearMutation.mutate();
  }, [clearMutation]);

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
