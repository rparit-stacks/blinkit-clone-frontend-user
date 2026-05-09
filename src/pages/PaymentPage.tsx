import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaChevronLeft, FaLock, FaMobileAlt, FaUniversity, FaCreditCard, FaCheckCircle } from "react-icons/fa";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { verifyPayment, orderKeys } from "@/lib/cartApi";
import { useQueryClient } from "@tanstack/react-query";

interface PaySession {
  orderId: string;
  razorpayOrderId: string;
  razorpayKeyId: string;
  amountPaise: number;
  currency: string;
}

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { clearCart } = useCart();
  const [method, setMethod] = useState<"upi" | "card" | "netbanking">("upi");
  const [upiId, setUpiId] = useState("");
  const [cardLast4, setCardLast4] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paySession, setPaySession] = useState<PaySession | null>(null);

  const orderId =
    (location.state as { orderId?: string } | null)?.orderId ??
    sessionStorage.getItem("pendingPaymentOrderId") ??
    "";

  useEffect(() => {
    if (!orderId) return;
    const raw = sessionStorage.getItem("pendingPaymentSession");
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as PaySession;
        if (parsed.orderId === orderId) {
          setPaySession(parsed);
          return;
        }
      } catch {
        // ignore
      }
    }
  }, [orderId]);

  if (!orderId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <h2 className="text-lg font-bold text-foreground">No pending order</h2>
          <p className="text-sm text-muted-foreground mt-1">Complete checkout first.</p>
          <Link to="/checkout" className="text-primary text-sm mt-3 inline-block">
            Back to checkout
          </Link>
        </div>
      </div>
    );
  }

  const amountRupees = paySession ? Math.round(paySession.amountPaise / 100) : null;
  const isStubMode = !paySession?.razorpayKeyId || paySession.razorpayKeyId.startsWith("rzp_test_dummy");

  const canPay = useMemo(() => {
    if (!paySession) return false;
    if (isStubMode) return true;
    if (method === "upi") return upiId.includes("@");
    if (method === "card") return cardLast4.trim().length === 4;
    return true;
  }, [method, upiId, cardLast4, paySession, isStubMode]);

  const handlePayNow = async () => {
    if (!canPay || isProcessing || !paySession) return;
    setIsProcessing(true);

    try {
      if (!isStubMode && typeof window !== "undefined" && (window as unknown as { Razorpay?: unknown }).Razorpay) {
        // Real Razorpay checkout
        await new Promise<void>((resolve, reject) => {
          const options = {
            key: paySession.razorpayKeyId,
            amount: paySession.amountPaise,
            currency: paySession.currency,
            order_id: paySession.razorpayOrderId,
            name: "Nainital Store",
            handler: async (response: {
              razorpay_order_id: string;
              razorpay_payment_id: string;
              razorpay_signature: string;
            }) => {
              try {
                await verifyPayment({
                  orderId: paySession.orderId,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                });
                resolve();
              } catch (e) {
                reject(e);
              }
            },
            modal: { ondismiss: () => reject(new Error("Payment cancelled")) },
          };
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        });
      } else {
        // Stub / dev mode — send dev_verified signature
        await verifyPayment({
          orderId: paySession.orderId,
          razorpayOrderId: paySession.razorpayOrderId ?? `rzp_stub_${paySession.orderId}`,
          razorpayPaymentId: `pay_${Date.now()}`,
          razorpaySignature: "dev_verified",
        });
      }

      sessionStorage.removeItem("pendingPaymentOrderId");
      sessionStorage.removeItem("pendingPaymentSession");
      clearCart();
      await qc.invalidateQueries({ queryKey: orderKeys.orders() });
      toast.success("Payment successful!");
      navigate(`/order-tracking/${orderId}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Payment failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-50 bg-[#F7F3FF] border-b border-violet-100/60 px-4 py-3 flex items-center gap-3">
        <Link
          to="/checkout"
          className="w-9 h-9 rounded-full bg-white/90 border border-violet-100 flex items-center justify-center text-foreground"
        >
          <FaChevronLeft className="w-3.5 h-3.5" />
        </Link>
        <h1 className="text-base font-bold text-foreground">Secure Payment</h1>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {!paySession && (
          <p className="text-sm text-muted-foreground text-center py-4">Preparing secure payment…</p>
        )}

        <div className="bg-card rounded-card shadow-card p-4 flex items-center gap-2 text-sm text-success">
          <FaLock className="w-4 h-4" />
          {isStubMode ? "Dev/stub mode — confirm with button below" : "Secured by Razorpay"}
        </div>

        {!isStubMode && (
          <div className="bg-card rounded-card shadow-card p-4 space-y-2">
            <h3 className="text-sm font-bold text-foreground mb-2">Choose Payment Method</h3>
            <button
              type="button"
              onClick={() => setMethod("upi")}
              className={`w-full flex items-center gap-3 p-3 rounded-button border ${method === "upi" ? "border-primary bg-primary/5" : "border-border"}`}
            >
              <FaMobileAlt className="w-4 h-4 text-primary" />
              <span className="text-sm">UPI</span>
            </button>
            <button
              type="button"
              onClick={() => setMethod("card")}
              className={`w-full flex items-center gap-3 p-3 rounded-button border ${method === "card" ? "border-primary bg-primary/5" : "border-border"}`}
            >
              <FaCreditCard className="w-4 h-4 text-primary" />
              <span className="text-sm">Card</span>
            </button>
            <button
              type="button"
              onClick={() => setMethod("netbanking")}
              className={`w-full flex items-center gap-3 p-3 rounded-button border ${method === "netbanking" ? "border-primary bg-primary/5" : "border-border"}`}
            >
              <FaUniversity className="w-4 h-4 text-primary" />
              <span className="text-sm">Net Banking</span>
            </button>
          </div>
        )}

        {method === "upi" && !isStubMode && (
          <div className="bg-card rounded-card shadow-card p-4">
            <label className="text-xs text-muted-foreground">Enter UPI ID</label>
            <input
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="name@bank"
              className="mt-2 w-full h-11 px-3 rounded-button bg-input border border-border text-sm outline-none focus:border-primary"
            />
          </div>
        )}

        {method === "card" && !isStubMode && (
          <div className="bg-card rounded-card shadow-card p-4">
            <label className="text-xs text-muted-foreground">Last 4 card digits</label>
            <input
              value={cardLast4}
              onChange={(e) => setCardLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="1234"
              className="mt-2 w-full h-11 px-3 rounded-button bg-input border border-border text-sm outline-none focus:border-primary"
            />
          </div>
        )}

        <div className="bg-card rounded-card shadow-card p-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Order</span>
            <span className="font-mono text-xs text-foreground truncate max-w-[200px]">{orderId}</span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-muted-foreground">Payable amount</span>
            <span className="font-bold text-primary">
              {amountRupees != null ? `₹${amountRupees}` : "—"}
            </span>
          </div>
        </div>

        <button
          type="button"
          disabled={!canPay || isProcessing || !paySession}
          onClick={handlePayNow}
          className="w-full h-12 rounded-button bg-primary text-primary-foreground font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <FaCheckCircle className="w-4 h-4" />
          {isProcessing
            ? "Processing..."
            : amountRupees != null
            ? `Pay ₹${amountRupees}`
            : "Pay now"}
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;
