import { useCallback, useEffect, useRef, useState } from "react";
import { FaShoppingCart, FaArrowRight, FaChevronUp } from "react-icons/fa";
import { useCart } from "@/context/CartContext";
import { Link } from "react-router-dom";

const HIDDEN_KEY = "nani_cart_bar_hidden";

const FloatingCartBar = () => {
  const { getTotalItems, getTotalPrice } = useCart();
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();
  const [hidden, setHidden] = useState(() => sessionStorage.getItem(HIDDEN_KEY) === "1");
  const [dragY, setDragY] = useState(0);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    if (totalItems === 0) {
      sessionStorage.removeItem(HIDDEN_KEY);
      setHidden(false);
      setDragY(0);
    }
  }, [totalItems]);

  const dismiss = useCallback(() => {
    setHidden(true);
    setDragY(0);
    sessionStorage.setItem(HIDDEN_KEY, "1");
  }, []);

  const restore = useCallback(() => {
    setHidden(false);
    sessionStorage.removeItem(HIDDEN_KEY);
  }, []);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const dy = e.touches[0].clientY - touchStartY.current;
    if (dy > 0) setDragY(Math.min(dy, 120));
  };

  const onTouchEnd = () => {
    if (dragY > 48) dismiss();
    else setDragY(0);
    touchStartY.current = null;
  };

  if (totalItems === 0) return null;

  const bottomClass = "bottom-[calc(var(--app-bottom-nav-height,4rem)+0.5rem)]";

  if (hidden) {
    return (
      <button
        type="button"
        onClick={restore}
        className={`fixed ${bottomClass} left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-lg active:scale-95 transition-transform`}
        aria-label="Show cart bar"
      >
        <FaShoppingCart className="w-3.5 h-3.5" />
        {totalItems} · ₹{totalPrice}
        <FaChevronUp className="w-3 h-3 opacity-80" />
      </button>
    );
  }

  const opacity = Math.max(0.35, 1 - dragY / 100);

  return (
    <div
      className={`fixed ${bottomClass} left-4 right-4 lg:left-auto lg:right-6 lg:w-80 z-40`}
      style={{
        transform: `translateY(${dragY}px)`,
        opacity,
        transition: dragY === 0 ? "transform 0.2s ease, opacity 0.2s ease" : "none",
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="flex justify-center pb-1 pointer-events-none">
        <div className="w-10 h-1 rounded-full bg-violet-300/80" aria-hidden />
      </div>
      <Link
        to="/cart"
        onClick={(e) => {
          if (dragY > 8) e.preventDefault();
        }}
        className="bg-white border border-violet-200/70 text-foreground rounded-2xl flex items-center justify-between px-4 py-2.5 shadow-[0_8px_24px_rgba(75,0,130,0.18)] active:scale-[0.98] transition-transform"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
            <FaShoppingCart className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] leading-none text-primary/80">Swipe down to hide</p>
            <p className="text-[13px] font-semibold truncate text-foreground">
              {totalItems} items · ₹{totalPrice}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-primary shrink-0">
          <span className="text-[12px] font-semibold">View</span>
          <FaArrowRight className="w-3 h-3" />
        </div>
      </Link>
    </div>
  );
};

export default FloatingCartBar;
