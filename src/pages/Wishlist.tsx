import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWishlist, removeFromWishlist, wishlistKeys, type WishlistProduct } from "@/lib/wishlistApi";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Link } from "react-router-dom";
import { FaChevronLeft, FaHeart, FaShoppingCart, FaStar } from "react-icons/fa";
import { toast } from "sonner";
import BottomNav from "@/components/customer/BottomNav";
import { Button } from "@/components/ui/button";

export default function Wishlist() {
  const qc = useQueryClient();
  const { addItem, getQuantity } = useCart();
  const { wishlistedIds } = useWishlist();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: wishlistKeys.list(),
    queryFn: fetchWishlist,
    retry: 1,
  });

  const items = Array.isArray(data) ? data : [];

  const removeMut = useMutation({
    mutationFn: (productId: string) => removeFromWishlist(productId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: wishlistKeys.list() });
      qc.invalidateQueries({ queryKey: wishlistKeys.ids() });
      toast.success("Removed from wishlist");
    },
    onError: () => toast.error("Could not remove item"),
  });

  const handleAddToCart = (item: WishlistProduct) => {
    const qty = getQuantity(item.productId);
    addItem(item.productId, qty);
    toast.success(`${item.name} added to cart`);
  };

  const discount = (item: WishlistProduct) => {
    const orig = item.originalPrice ?? 0;
    const price = item.price ?? 0;
    if (orig > price && orig > 0) {
      return Math.round(((orig - price) / orig) * 100);
    }
    return 0;
  };

  const destination = (item: WishlistProduct) =>
    item.storeCategory === "food" && item.restaurantId
      ? `/restaurant/${item.restaurantId}?food=${item.productId}`
      : `/product/${item.productId}`;

  return (
    <div className="min-h-[100dvh] bg-[#FAFAFA] flex flex-col pb-[calc(3.5rem+1rem)]">
      <header className="sticky top-0 z-50 bg-[#F7F3FF] border-b border-violet-100/80 px-4 py-3 flex items-center gap-3">
        <Link
          to="/"
          className="w-9 h-9 rounded-full bg-white border border-violet-100 flex items-center justify-center text-foreground active:scale-95 transition-transform"
        >
          <FaChevronLeft className="w-3.5 h-3.5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-foreground">My Wishlist</h1>
          {!isLoading && !isError && (
            <p className="text-xs text-muted-foreground">
              {items.length} saved item{items.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <FaHeart className="w-5 h-5 text-red-400 shrink-0" />
      </header>

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-4">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-100" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-4/5" />
                  <div className="h-8 bg-gray-100 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <p className="text-sm font-semibold text-foreground">Could not load wishlist</p>
            <p className="text-xs text-muted-foreground mt-2 max-w-xs">
              {error instanceof Error ? error.message : "Please try again"}
            </p>
            <Button type="button" className="mt-4 rounded-xl" onClick={() => void refetch()}>
              Retry
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <FaHeart className="w-8 h-8 text-red-300" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Nothing saved yet</h2>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Tap the heart on any product to save it here
            </p>
            <Link
              to="/"
              className="mt-6 px-6 py-3 bg-primary text-white rounded-2xl font-semibold text-sm active:scale-[0.98]"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {items.map((item) => {
              const off = discount(item);
              const qty = getQuantity(item.productId);
              const inWishlist = wishlistedIds.has(item.productId);

              return (
                <div
                  key={item.wishlistItemId || item.productId}
                  className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col"
                >
                  <Link to={destination(item)} className="relative block">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full aspect-square object-cover bg-gray-50"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full aspect-square bg-gray-100 flex items-center justify-center text-xs text-muted-foreground">
                        No image
                      </div>
                    )}
                    {off > 0 && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-primary text-[10px] font-bold text-white">
                        {off}% OFF
                      </div>
                    )}
                    {!item.available && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold bg-black/60 px-2 py-1 rounded-full">
                          Out of Stock
                        </span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeMut.mutate(item.productId);
                      }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm active:scale-95"
                      aria-label="Remove from wishlist"
                    >
                      <FaHeart className={`w-3.5 h-3.5 ${inWishlist ? "text-red-500" : "text-gray-300"}`} />
                    </button>
                  </Link>

                  <div className="p-3 flex flex-col flex-1">
                    <Link to={destination(item)}>
                      <p className="text-[13px] font-semibold text-foreground line-clamp-2 leading-snug">
                        {item.name}
                      </p>
                      {item.unit ? (
                        <p className="text-[11px] text-muted-foreground mt-0.5">{item.unit}</p>
                      ) : null}
                    </Link>

                    {(item.rating ?? 0) > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <FaStar className="w-2.5 h-2.5 text-yellow-400" />
                        <span className="text-[11px] text-muted-foreground">
                          {Number(item.rating).toFixed(1)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-baseline gap-1.5 mt-1.5">
                      <span className="text-[15px] font-bold text-foreground">₹{item.price}</span>
                      {off > 0 && (
                        <span className="text-[11px] text-muted-foreground line-through">
                          ₹{item.originalPrice}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={!item.available}
                      onClick={() => handleAddToCart(item)}
                      className={`mt-2.5 w-full h-9 rounded-xl flex items-center justify-center gap-1.5 text-[12px] font-bold transition-colors ${
                        item.available
                          ? qty > 0
                            ? "bg-primary text-white"
                            : "border-[1.5px] border-primary text-primary bg-white"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <FaShoppingCart className="w-3 h-3" />
                      {qty > 0 ? `In cart (${qty})` : "Add to cart"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
