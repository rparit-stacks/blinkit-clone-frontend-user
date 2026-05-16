import { useEffect, useRef, useState } from "react";
import {
  FaChevronLeft, FaMapMarkerAlt, FaPlus, FaMoneyBillWave,
  FaCreditCard, FaArrowRight, FaExclamationTriangle, FaTag,
  FaCheckCircle, FaTimesCircle,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { createOrder, orderKeys, validateCoupon, type CouponValidateResponse } from "@/lib/cartApi";
import type { AddressPayload } from "@/lib/userProfile";
import { fetchMyProfile } from "@/lib/userProfile";
import { checkDeliveryZone } from "@/lib/locationApi";

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

  // Zone
  const [zoneBlocked, setZoneBlocked] = useState(false);
  const [zoneMsg, setZoneMsg] = useState("");

  // Coupon
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [coupon, setCoupon] = useState<CouponValidateResponse | null>(null);
  const [couponError, setCouponError] = useState("");
  const couponRef = useRef<HTMLInputElement>(null);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["me", "profile"],
    queryFn: fetchMyProfile,
  });

  useEffect(() => {
    if (!profile?.addresses?.length) return;
    const def = profile.addresses.find((a) => a.defaultAddress) ?? profile.addresses[0];
    setSelectedAddress((prev) => (prev ? prev : def.id ?? ""));
  }, [profile]);

  // Zone check
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        checkDeliveryZone(coords.latitude, coords.longitude)
          .then((r) => { if (!r.inZone) { setZoneBlocked(true); setZoneMsg(r.message); } })
          .catch(() => {});
      },
      () => {}
    );
  }, []);

  const items = cart?.items ?? [];
  const subtotal = cart?.subtotal ?? 0;
  const deliveryFee = cart?.deliveryFee ?? 0;
  const taxes = cart?.taxes ?? 0;
  const discount = coupon?.discountAmount ?? 0;
  const total = Math.max(0, subtotal + deliveryFee + taxes - discount);

  const addresses = profile?.addresses ?? [];
  const selected = addresses.find((a) => a.id === selectedAddress);
  const canContinue = items.length > 0 && !!selected;

  const applyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponError("");
    setCoupon(null);
    setCouponLoading(true);
    try {
      const res = await validateCoupon(code, subtotal);
      setCoupon(res);
      toast.success(`Coupon applied! You save ₹${res.discountAmount}`);
    } catch (e) {
      setCouponError(e instanceof Error ? e.message : "Invalid coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponInput("");
    setCouponError("");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-lg font-bold text-foreground">No items to checkout</h2>
          <p className="text-sm text-muted-foreground mt-1">Please add products to your cart first.</p>
          <Link to="/cart" className="text-primary text-sm mt-3 inline-block">Go to Cart</Link>
        </div>
      </div>
    );
  }

  const submitOrder = async (mode: "cod" | "razorpay") => {
    if (!selected || !canContinue) return;
    setPlacing(true);
    const idem = crypto.randomUUID();
    try {
      const snapshot = JSON.stringify({ ...selected, display: formatAddressLine(selected) });
      const res = await createOrder({
        addressId: selected.id,
        addressSnapshotJson: snapshot,
        paymentMode: mode,
        idempotencyKey: idem,
        couponCode: coupon?.code,
      });

      await qc.invalidateQueries({ queryKey: orderKeys.orders() });

      if (mode === "cod") {
        clearCart();
        toast.success("Order placed successfully!");
        navigate(`/order-tracking/${res.orderId}`);
      } else {
        sessionStorage.setItem("pendingPaymentOrderId", res.orderId);
        sessionStorage.setItem("pendingPaymentSession", JSON.stringify({
          orderId: res.orderId,
          razorpayOrderId: res.razorpayOrderId,
          razorpayKeyId: res.razorpayKeyId,
          amountPaise: res.amountPaise,
          currency: res.currency,
        }));
        navigate("/payment", { state: { orderId: res.orderId } });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not place order");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="mobile-page bg-background">
      <header className="sticky top-0 z-50 bg-[#F7F3FF] border-b border-violet-100/60 px-4 py-3 flex items-center gap-3">
        <Link to="/cart" className="w-9 h-9 rounded-full bg-white/90 border border-violet-100 flex items-center justify-center text-foreground">
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
              <Link to="/addresses" className="text-primary font-medium mt-2 inline-block">Add an address</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {addresses.map((addr) => (
                <button
                  key={addr.id ?? addr.line1}
                  type="button"
                  onClick={() => addr.id && setSelectedAddress(addr.id)}
                  className={`w-full text-left p-3 rounded-button border transition-colors ${selectedAddress === addr.id ? "border-primary bg-primary/5" : "border-border"}`}
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

        {/* Coupon */}
        <div className="bg-card rounded-card shadow-card p-4">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <FaTag className="w-4 h-4 text-primary" /> Coupon / Promo Code
          </h3>

          {coupon ? (
            /* Applied state */
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-3">
              <FaCheckCircle className="w-5 h-5 text-green-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-green-800 font-mono">{coupon.code}</p>
                <p className="text-xs text-green-700 mt-0.5">
                  {coupon.description || (coupon.discountType === "PERCENT"
                    ? `${coupon.discountValue}% off`
                    : `₹${coupon.discountValue} off`)}
                  {" · "}
                  <span className="font-semibold">You save ₹{coupon.discountAmount}</span>
                </p>
              </div>
              <button
                onClick={removeCoupon}
                className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                title="Remove coupon"
              >
                <FaTimesCircle className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Input state */
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  ref={couponRef}
                  value={couponInput}
                  onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(""); }}
                  onKeyDown={e => e.key === "Enter" && applyCoupon()}
                  placeholder="Enter coupon code"
                  className="flex-1 border border-border rounded-button px-3 py-2.5 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary/30 tracking-widest"
                />
                <button
                  onClick={applyCoupon}
                  disabled={!couponInput.trim() || couponLoading}
                  className="px-4 py-2.5 bg-primary text-white rounded-button text-sm font-semibold disabled:opacity-50 hover:bg-primary/90 transition-colors whitespace-nowrap"
                >
                  {couponLoading ? "Checking…" : "Apply"}
                </button>
              </div>
              {couponError && (
                <div className="flex items-center gap-2 text-red-600 text-xs">
                  <FaTimesCircle className="w-3.5 h-3.5 shrink-0" />
                  {couponError}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Payment Method */}
        <div className="bg-card rounded-card shadow-card p-4">
          <h3 className="text-sm font-bold text-foreground mb-3">Payment Method</h3>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setPaymentMethod("cod")}
              className={`w-full flex items-center gap-3 p-3 rounded-button border transition-colors ${paymentMethod === "cod" ? "border-primary bg-primary/5" : "border-border"}`}
            >
              <FaMoneyBillWave className="w-4 h-4 text-success" />
              <span className="text-sm font-medium text-foreground">Cash on Delivery</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("razorpay")}
              className={`w-full flex items-center gap-3 p-3 rounded-button border transition-colors ${paymentMethod === "razorpay" ? "border-primary bg-primary/5" : "border-border"}`}
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
              <span className="text-muted-foreground">{item.productName} × {item.quantity}</span>
              <span className="text-foreground">₹{item.lineTotal}</span>
            </div>
          ))}
          <div className="border-t border-border pt-2 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery</span>
              <span>{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Taxes</span>
              <span>₹{taxes}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-green-600 font-medium">
                <span className="flex items-center gap-1.5">
                  <FaTag className="w-3 h-3" /> Coupon ({coupon?.code})
                </span>
                <span>− ₹{discount}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold pt-1 border-t border-border mt-1">
              <span className="text-foreground">Total</span>
              <span className="text-primary">₹{total}</span>
            </div>
          </div>
        </div>

        {/* Out of zone warning */}
        {zoneBlocked && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
            <FaExclamationTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-800">Delivery not available here</p>
              <p className="text-xs text-red-600 mt-0.5">{zoneMsg}</p>
              <button className="mt-2 text-xs text-red-700 font-medium underline" onClick={() => setZoneBlocked(false)}>
                Place anyway (override)
              </button>
            </div>
          </div>
        )}

        <button
          type="button"
          disabled={!canContinue || placing || zoneBlocked}
          onClick={() => submitOrder(paymentMethod)}
          className={`w-full h-14 rounded-button flex items-center justify-center gap-2 font-bold text-base shadow-cart-bar ${
            canContinue && !placing && !zoneBlocked
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
