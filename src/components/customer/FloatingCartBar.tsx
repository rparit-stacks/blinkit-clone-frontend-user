import { FaShoppingCart, FaArrowRight } from "react-icons/fa";
import { useCart } from "@/context/CartContext";
import { Link } from "react-router-dom";

const FloatingCartBar = () => {
  const { getTotalItems, getTotalPrice } = useCart();
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();
  if (totalItems === 0) return null;

  return (
    <Link
      to="/cart"
      className="fixed bottom-16 left-4 right-4 lg:bottom-6 lg:left-auto lg:right-6 lg:w-80 z-40 bg-white border border-violet-200/70 text-foreground rounded-2xl flex items-center justify-between px-4 py-2.5 shadow-[0_8px_24px_rgba(75,0,130,0.18)] hover:scale-[1.02] active:scale-[0.98] transition-transform"
    >
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
          <FaShoppingCart className="w-3.5 h-3.5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] leading-none text-primary/80">Added in your cart</p>
          <p className="text-[13px] font-semibold truncate text-foreground">
            {totalItems} items | ₹{totalPrice}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1 text-primary">
        <span className="text-[12px] font-semibold">View</span>
        <FaArrowRight className="w-3 h-3" />
      </div>
    </Link>
  );
};

export default FloatingCartBar;
