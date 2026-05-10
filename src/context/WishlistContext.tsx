import { createContext, useContext, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWishlistIds, toggleWishlist, wishlistKeys } from "@/lib/wishlistApi";
import { getAccessToken } from "@/lib/api";
import { toast } from "sonner";

interface WishlistCtx {
  wishlistedIds: Set<string>;
  isWishlisted: (id: string) => boolean;
  toggle: (id: string) => void;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistCtx>({
  wishlistedIds: new Set(),
  isWishlisted: () => false,
  toggle: () => {},
  isLoading: false,
});

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient();
  const loggedIn = !!getAccessToken();

  const { data: ids = [], isLoading } = useQuery({
    queryKey: wishlistKeys.ids(),
    queryFn: fetchWishlistIds,
    enabled: loggedIn,
    staleTime: 5 * 60 * 1000,
  });

  const wishlistedIds = new Set(ids);

  const { mutate } = useMutation({
    mutationFn: toggleWishlist,
    onMutate: async (productId) => {
      await qc.cancelQueries({ queryKey: wishlistKeys.ids() });
      const prev = qc.getQueryData<string[]>(wishlistKeys.ids()) ?? [];
      const next = prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      qc.setQueryData(wishlistKeys.ids(), next);
      return { prev };
    },
    onSuccess: (data) => {
      toast.success(data.wishlisted ? "Added to wishlist ❤️" : "Removed from wishlist");
      qc.invalidateQueries({ queryKey: wishlistKeys.list() });
    },
    onError: (_err, _pid, ctx) => {
      if (ctx?.prev) qc.setQueryData(wishlistKeys.ids(), ctx.prev);
      toast.error("Login to save to wishlist");
    },
  });

  const toggle = useCallback((id: string) => {
    if (!getAccessToken()) { toast.error("Login to save to wishlist"); return; }
    mutate(id);
  }, [mutate]);

  return (
    <WishlistContext.Provider value={{
      wishlistedIds,
      isWishlisted: (id) => wishlistedIds.has(id),
      toggle,
      isLoading,
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
