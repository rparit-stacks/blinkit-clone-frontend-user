import { FaChevronLeft, FaPlus, FaMinus, FaTrash, FaTag, FaArrowRight, FaShoppingBag } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import BottomNav from "@/components/customer/BottomNav";
import type { CartItemDto } from "@/lib/cartApi";

const CategoryLabel: Record<string, string> = {
  food: "Food",
  bazaar: "Bazaar",
  electronic: "Electronics",
};

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, isLoading, addItem, removeItem, getQuantity } = useCart();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading cart…</p>
      </div>
    );
  }

  const items = cart?.items ?? [];
  const subtotal = cart?.subtotal ?? 0;
  const deliveryFee = cart?.deliveryFee ?? 0;
  const taxes = cart?.taxes ?? 0;
  const total = cart?.total ?? 0;

  // Group items by store category for display
  const grouped = items.reduce<Record<string, CartItemDto[]>>((acc, item) => {
    const cat = item.storeCategory || "food";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div className="mobile-page bg-background">
      <header className="sticky top-0 z-50 bg-[#F7F3FF] border-b border-violet-100/60 px-4 py-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-white/90 border border-violet-100 flex items-center justify-center text-foreground"
        >
          <FaChevronLeft className="w-3.5 h-3.5" />
        </button>
        <h1 className="text-base font-bold text-foreground">Your Cart</h1>
        <span className="text-sm text-muted-foreground ml-auto">
          {items.length} {items.length === 1 ? "item" : "items"}
        </span>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FaShoppingBag className="text-6xl text-muted mb-4" />
            <h3 className="text-lg font-bold text-foreground">Your cart is empty</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">Add some items to get started</p>
            <Link
              to="/"
              className="h-10 px-6 bg-primary text-primary-foreground rounded-button flex items-center text-sm font-medium"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <>
            {Object.entries(grouped).map(([category, catItems]) => (
              <div key={category}>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">
                  {CategoryLabel[category] ?? category}
                </p>
                <div className="space-y-3">
                  {catItems.map((item) => {
                    const qty = getQuantity(item.productId);
                    return (
                      <div key={item.productId} className="bg-card rounded-card shadow-card p-3 flex gap-3">
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-20 h-20 rounded-button object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-foreground truncate">{item.productName}</h3>
                          <p className="text-[11px] text-muted-foreground">{item.unit}</p>
                          {item.originalPrice > item.price && (
                            <p className="text-[10px] text-muted-foreground line-through">₹{item.originalPrice}</p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm font-bold text-primary">₹{item.lineTotal}</span>
                            <div className="flex items-center gap-2 bg-primary rounded-button px-2 h-8">
                              <button
                                type="button"
                                onClick={() => removeItem(item.productId, qty)}
                                className="text-primary-foreground"
                              >
                                {qty === 1 ? (
                                  <FaTrash className="w-3 h-3" />
                                ) : (
                                  <FaMinus className="w-3 h-3" />
                                )}
                              </button>
                              <span className="text-primary-foreground text-sm font-bold min-w-[16px] text-center">
                                {qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => addItem(item.productId, qty)}
                                className="text-primary-foreground"
                              >
                                <FaPlus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="bg-card rounded-card shadow-card p-3 flex items-center gap-3">
              <FaTag className="w-4 h-4 text-primary" />
              <input
                type="text"
                placeholder="Apply Promo Code"
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              <button
                type="button"
                className="px-4 py-1.5 bg-primary text-primary-foreground rounded-button text-xs font-bold"
              >
                Apply
              </button>
            </div>

            <div className="bg-card rounded-card shadow-card p-4 space-y-2">
              <h3 className="text-sm font-bold text-foreground mb-2">Bill Details</h3>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Item Total</span>
                <span className="text-foreground">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span className="text-foreground">
                  {deliveryFee === 0 ? (
                    <>
                      <span className="text-success font-medium">FREE</span>{" "}
                      <span className="line-through text-muted-foreground">₹30</span>
                    </>
                  ) : (
                    `₹${deliveryFee}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Taxes</span>
                <span className="text-foreground">₹{taxes}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between text-base font-bold">
                <span className="text-foreground">To Pay</span>
                <span className="text-primary">₹{total}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="w-full h-14 bg-primary text-primary-foreground rounded-button flex items-center justify-center gap-2 font-bold text-base shadow-cart-bar"
            >
              Proceed to Checkout <FaArrowRight className="w-4 h-4" />
            </Link>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default CartPage;
