import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWishlist, removeFromWishlist, wishlistKeys, type WishlistProduct } from "@/lib/wishlistApi";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Link } from "react-router-dom";
import { FaChevronLeft, FaHeart, FaShoppingCart, FaTrash, FaStar } from "react-icons/fa";
import { toast } from "sonner";
import BottomNav from "@/components/customer/BottomNav";

export default function Wishlist() {
  const qc = useQueryClient();
  const { addItem, getQuantity } = useCart();
  const { toggle: toggleWish } = useWishlist();

  const { data: items = [], isLoading } = useQuery({
    queryKey: wishlistKeys.list(),
    queryFn: fetchWishlist,
  });

  const removeMut = useMutation({
    mutationFn: (productId: string) => removeFromWishlist(productId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: wishlistKeys.list() });
      qc.invalidateQueries({ queryKey: wishlistKeys.ids() });
    },
    onError: () => toast.error("Could not remove item"),
  });

  const handleAddToCart = (item: WishlistProduct) => {
    const qty = getQuantity(item.productId);
    addItem(item.productId, qty);
    toast.success(`${item.name} added to cart`);
  };

  const discount = (item: WishlistProduct) =>
    item.originalPrice > item.price
      ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
      : 0;

  const destination = (item: WishlistProduct) =>
    item.storeCategory === "food" && item.restaurantId
      ? `/restaurant/${item.restaurantId}?food=${item.productId}`
      : `/product/${item.productId}`;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-border px-4 py-3 flex items-center gap-3">
        <Link to="/" className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-foreground">
          <FaChevronLeft className="w-3.5 h-3.5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-base font-bold text-foreground">My Wishlist</h1>
          {!isLoading && <p className="text-xs text-muted-foreground">{items.length} saved item{items.length !== 1 ? "s" : ""}</p>}
        </div>
        <FaHeart className="w-5 h-5 text-red-400" />
      </header>

      <div className="max-w-2xl mx-auto px-4 py-4">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-slate-100" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-slate-100 rounded w-4/5" />
                  <div className="h-3 bg-slate-100 rounded w-2/3" />
                  <div className="h-8 bg-slate-100 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center mb-5">
              <FaHeart className="w-10 h-10 text-red-200" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Nothing saved yet</h2>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Tap the ❤️ on any product to save it here for later
            </p>
            <Link
              to="/"
              className="mt-6 px-6 py-3 bg-primary text-white rounded-2xl font-semibold text-sm"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {items.map((item) => {
              const off = discount(item);
              const qty = getQuantity(item.productId);
              return (
                <div
                  key={item.wishlistItemId}
                  className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.07)] overflow-hidden flex flex-col"
                >
                  {/* Image */}
                  <Link to={destination(item)} className="relative block">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full aspect-square object-cover"
                    />
                    {off > 0 && (
                      <div className="absolute top-2 left-2 w-10 h-10 rounded-full bg-primary flex flex-col items-center justify-center">
                        <span className="text-[11px] font-extrabold text-white leading-none">{off}%</span>
                        <span className="text-[8px] font-bold text-white/80 leading-none">OFF</span>
                      </div>
                    )}
                    {!item.available && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white text-xs font-bold bg-black/60 px-2 py-1 rounded-full">Out of Stock</span>
                      </div>
                    )}
                    {/* Remove from wishlist */}
                    <button
                      type="button"
                      onClick={e => { e.preventDefault(); removeMut.mutate(item.productId); toggleWish(item.productId); }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow-sm active:scale-110 transition-transform"
                    >
                      <FaHeart className="w-3 h-3 text-red-500" />
                    </button>
                  </Link>

                  {/* Info */}
                  <div className="p-3 flex flex-col flex-1">
                    <Link to={destination(item)}>
                      <p className="text-[13px] font-semibold text-foreground line-clamp-2 leading-snug">{item.name}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{item.unit}</p>
                    </Link>

                    {/* Rating */}
                    {item.rating > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <FaStar className="w-2.5 h-2.5 text-yellow-400" />
                        <span className="text-[11px] text-muted-foreground">{item.rating.toFixed(1)}</span>
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-[15px] font-bold text-foreground">₹{item.price}</span>
                      {off > 0 && (
                        <span className="text-[11px] text-muted-foreground line-through">₹{item.originalPrice}</span>
                      )}
                    </div>

                    {/* Add to cart */}
                    <button
                      type="button"
                      disabled={!item.available}
                      onClick={() => handleAddToCart(item)}
                      className={`mt-2 w-full h-8 rounded-lg flex items-center justify-center gap-1.5 text-[12px] font-bold transition-colors ${
                        item.available
                          ? qty > 0
                            ? "bg-primary text-white"
                            : "bg-white border-[1.5px] border-primary text-primary hover:bg-primary/5"
                          : "bg-slate-100 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      <FaShoppingCart className="w-3 h-3" />
                      {qty > 0 ? `In Cart (${qty})` : "Add to Cart"}
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
