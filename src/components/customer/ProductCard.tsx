import { FaPlus, FaMinus, FaHeart } from "react-icons/fa";
import type { ApiProduct } from "@/lib/catalogApi";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Link } from "react-router-dom";

interface ProductCardProps {
  product: ApiProduct;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem, removeItem, getQuantity } = useCart();
  const { isWishlisted, toggle: toggleWish } = useWishlist();
  const qty = getQuantity(product.id);
  const discount =
    product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  const destination =
    product.storeCategory === "food" && product.restaurantId
      ? `/restaurant/${product.restaurantId}?food=${product.id}`
      : `/product/${product.id}`;

  return (
    <div className="group bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.07)] overflow-hidden flex flex-col h-full transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.98]">
      <Link to={destination} className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full aspect-square object-cover"
          loading="lazy"
        />
        {discount > 0 && (
          <div className="absolute top-2 left-2 w-10 h-10 rounded-full bg-primary flex flex-col items-center justify-center">
            <span className="text-[11px] font-extrabold text-white leading-none">{discount}%</span>
            <span className="text-[8px] font-bold text-white/80 leading-none">OFF</span>
          </div>
        )}
        <button
          type="button"
          onClick={e => { e.preventDefault(); toggleWish(product.id); }}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow-sm active:scale-110 transition-transform"
        >
          <FaHeart className={`w-3 h-3 transition-colors ${isWishlisted(product.id) ? "text-red-500" : "text-gray-300"}`} />
        </button>
      </Link>
      <div className="p-3 flex flex-col flex-1">
        <Link to={destination}>
          <h3 className="text-[13px] font-semibold text-foreground line-clamp-2 leading-snug">{product.name}</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">{product.unit}</p>
        </Link>
        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-[15px] font-bold text-foreground">₹{product.price}</span>
              {discount > 0 && (
                <span className="text-[11px] text-muted-foreground line-through">₹{product.originalPrice}</span>
              )}
            </div>
          </div>
          {qty === 0 ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addItem(product.id, 0, product);
              }}
              className="px-4 h-8 rounded-lg bg-white border-[1.5px] border-primary text-primary text-[12px] font-bold active:scale-95 transition-transform"
            >
              ADD
            </button>
          ) : (
            <div className="flex items-center gap-0 border-[1.5px] border-primary rounded-lg overflow-hidden h-8">
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeItem(product.id, qty); }}
                className="w-7 h-full flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
              >
                <FaMinus className="w-2.5 h-2.5" />
              </button>
              <span className="w-7 text-center text-[12px] font-bold text-primary">{qty}</span>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); addItem(product.id, qty, product); }}
                className="w-7 h-full flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
              >
                <FaPlus className="w-2.5 h-2.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
