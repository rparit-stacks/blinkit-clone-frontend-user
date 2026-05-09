import { useEffect, useState } from "react";
import { FaChevronLeft, FaMapMarkerAlt, FaPlus, FaMoneyBillWave, FaCreditCard, FaArrowRight } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { createOrder, orderKeys } from "@/lib/cartApi";
import type { AddressPayload } from "@/lib/userProfile";
import { fetchMyProfile } from "@/lib/userProfile";

function formatAddressLine(a: AddressPayload): string {
  const parts = [a.line1, a.line2, a.city, a.state, a.pincode].filter(Boolean);
  return `${a.label}: ${parts.join(", ")}`;
}

const Checkout = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { cart, clearCart } = useCart();
  const [selectedAddress, setSelectedAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "razorpay">("cod");
  const [placing, setPlacing] = useState(false);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["me", "profile"],
    queryFn: fetchMyProfile,
  });

  useEffect(() => {
    if (!profile?.addresses?.length) return;
    const def = profile.addresses.find((a) => a.defaultAddress) ?? profile.addresses[0];
    setSelectedAddress((prev) => (prev ? prev : def.id ?? ""));
  }, [profile]);

  const items = cart?.items ?? [];
  const subtotal = cart?.subtotal ?? 0;
  const deliveryFee = cart?.deliveryFee ?? 0;
  const taxes = cart?.taxes ?? 0;
  const total = cart?.total ?? 0;
  const addresses = profile?.addresses ?? [];
  const selected = addresses.find((a) => a.id === selectedAddress);
  const canContinue = items.length > 0 && !!selected;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-lg font-bold text-foreground">No items to checkout</h2>
          <p className="text-sm text-muted-foreground mt-1">Please add products to your cart first.</p>
          <Link to="/cart" className="text-primary text-sm mt-3 inline-block">
            Go to Cart
          </Link>
        </div>
      </div>
    );
  }

  const submitOrder = async (mode: "cod" | "razorpay") => {
    if (!selected || !canContinue) return;
    setPlacing(true);
    const idem = crypto.randomUUID();
    try {
      const snapshot = JSON.stringify({
        ...selected,
        display: formatAddressLine(selected),
      });
      const res = await createOrder({
        addressId: selected.id,
        addressSnapshotJson: snapshot,
        paymentMode: mode,
        idempotencyKey: idem,
      });

      await qc.invalidateQueries({ queryKey: orderKeys.orders() });

      if (mode === "cod") {
        clearCart();
        toast.success("Order placed successfully!");
        navigate(`/order-tracking/${res.orderId}`);
      } else {
        sessionStorage.setItem("pendingPaymentOrderId", res.orderId);
        sessionStorage.setItem(
          "pendingPaymentSession",
          JSON.stringify({
            orderId: res.orderId,
            razorpayOrderId: res.razorpayOrderId,
            razorpayKeyId: res.razorpayKeyId,
            amountPaise: res.amountPaise,
            currency: res.currency,
          })
        );
        navigate("/payment", { state: { orderId: res.orderId } });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not place order");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-50 bg-[#F7F3FF] border-b border-violet-100/60 px-4 py-3 flex items-center gap-3">
        <Link
          to="/cart"
          className="w-9 h-9 rounded-full bg-white/90 border border-violet-100 flex items-center justify-center text-foreground"
        >
          <FaChevronLeft className="w-3.5 h-3.5" />
        </Link>
        <h1 className="text-base font-bold text-foreground">Checkout</h1>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Delivery Address */}
        <div className="bg-card rounded-card shadow-card p-4">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <FaMapMarkerAlt className="w-4 h-4 text-primary" /> Delivery Address
          </h3>
          {profileLoading ? (
            <p className="text-sm text-muted-foreground">Loading addresses…</p>
          ) : addresses.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              <p>No saved addresses.</p>
              <Link to="/addresses" className="text-primary font-medium mt-2 inline-block">
                Add an address
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {addresses.map((addr) => (
                <button
                  key={addr.id ?? addr.line1}
                  type="button"
                  onClick={() => addr.id && setSelectedAddress(addr.id)}
                  className={`w-full text-left p-3 rounded-button border transition-colors ${
                    selectedAddress === addr.id ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <p className="text-sm font-medium text-foreground">{addr.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatAddressLine(addr)}</p>
                </button>
              ))}
            </div>
          )}
          <Link to="/addresses" className="mt-3 flex items-center gap-2 text-primary text-sm font-medium">
            <FaPlus className="w-3 h-3" /> Add / manage addresses
          </Link>
        </div>

        {/* Payment Method */}
        <div className="bg-card rounded-card shadow-card p-4">
          <h3 className="text-sm font-bold text-foreground mb-3">Payment Method</h3>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setPaymentMethod("cod")}
              className={`w-full flex items-center gap-3 p-3 rounded-button border transition-colors ${
                paymentMethod === "cod" ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <FaMoneyBillWave className="w-4 h-4 text-success" />
              <span className="text-sm font-medium text-foreground">Cash on Delivery</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("razorpay")}
              className={`w-full flex items-center gap-3 p-3 rounded-button border transition-colors ${
                paymentMethod === "razorpay" ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <FaCreditCard className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Pay Online (Razorpay)</span>
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-card rounded-card shadow-card p-4 space-y-2">
          <h3 className="text-sm font-bold text-foreground mb-2">Order Summary</h3>
          {items.map((item) => (
            <div key={item.productId} className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {item.productName} × {item.quantity}
              </span>
              <span className="text-foreground">₹{item.lineTotal}</span>
            </div>
          ))}
          <div className="border-t border-border pt-2 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery</span>
              <span>{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Taxes</span>
              <span>₹{taxes}</span>
            </div>
            <div className="flex justify-between text-base font-bold pt-1">
              <span className="text-foreground">Total</span>
              <span className="text-primary">₹{total}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          disabled={!canContinue || placing}
          onClick={() => submitOrder(paymentMethod)}
          className={`w-full h-14 rounded-button flex items-center justify-center gap-2 font-bold text-base shadow-cart-bar ${
            canContinue && !placing
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }`}
        >
          {placing
            ? "Placing…"
            : paymentMethod === "cod"
            ? "Place COD Order"
            : "Continue to Payment"}{" "}
          <FaArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Checkout;
