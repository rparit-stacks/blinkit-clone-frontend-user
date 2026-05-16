import { FaChevronLeft, FaCheckCircle, FaCircle, FaMotorcycle, FaClock, FaTimesCircle } from "react-icons/fa";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import BottomNav from "@/components/customer/BottomNav";
import { fetchOrderById, orderKeys, type OrderDto } from "@/lib/cartApi";

// Map backend OrderStatus → timeline progress
function buildTimeline(status: string) {
  const statuses = ["PENDING", "PROCESSING", "DISPATCHED", "DELIVERED"];
  const labels = ["Placed", "Confirmed", "On the way", "Delivered"];
  const currentIdx = statuses.indexOf(status);
  return labels.map((label, i) => ({
    label,
    done: i < currentIdx,
    current: i === currentIdx,
  }));
}

function statusLabel(status: string): string {
  switch (status) {
    case "PENDING": return "Awaiting payment confirmation";
    case "PROCESSING": return "Order confirmed, preparing…";
    case "DISPATCHED": return "Out for delivery";
    case "DELIVERED": return "Delivered";
    case "CANCELLED": return "Order cancelled";
    case "PAID": return "Payment confirmed";
    default: return status.replace("_", " ").toLowerCase();
  }
}

const OrderTracking = () => {
  const { orderId } = useParams();
  const oid = orderId ?? "";

  const { data: order, isLoading, isError } = useQuery<OrderDto | null>({
    queryKey: orderKeys.order(oid),
    queryFn: () => fetchOrderById(oid),
    enabled: !!oid,
    staleTime: 30 * 1000,
    refetchInterval: (query) => {
      const data = query.state.data as OrderDto | null | undefined;
      const active = data && !["DELIVERED", "CANCELLED"].includes(data.status);
      return active ? 30_000 : false;
    },
  });

  const steps = order ? buildTimeline(order.status) : [];
  const isCancelled = order?.status === "CANCELLED";

  if (!oid) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">Missing order id</p>
      </div>
    );
  }

  return (
    <div className="mobile-page bg-background">
      <header className="sticky top-0 z-50 bg-[#F7F3FF] border-b border-violet-100/60 px-4 py-3 flex items-center gap-3">
        <Link
          to="/orders"
          className="w-9 h-9 rounded-full bg-white/90 border border-violet-100 flex items-center justify-center text-foreground"
        >
          <FaChevronLeft className="w-3.5 h-3.5" />
        </Link>
        <h1 className="text-base font-bold text-foreground truncate flex-1">
          {isLoading ? "Loading…" : order ? `Order #${order.id.slice(0, 8)}…` : "Order"}
        </h1>
        {order && !isCancelled && (
          <div className="ml-auto flex items-center gap-1 text-primary shrink-0">
            <FaClock className="w-3 h-3" />
            <span className="text-sm font-bold">Live</span>
          </div>
        )}
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {isError && (
          <p className="text-sm text-destructive text-center">Could not load this order.</p>
        )}
        {isLoading && <p className="text-sm text-muted-foreground text-center">Loading order…</p>}
        {!isLoading && !order && !isError && (
          <p className="text-sm text-muted-foreground text-center">Order not found.</p>
        )}

        {order && (
          <>
            {/* Timeline (skip for cancelled orders) */}
            {!isCancelled ? (
              <div className="bg-card rounded-card shadow-card p-4">
                <div className="flex items-center justify-between mb-6">
                  {steps.map((step, i) => (
                    <div key={step.label} className="flex flex-col items-center flex-1 relative">
                      {i > 0 && (
                        <div
                          className={`absolute top-3 right-1/2 w-full h-0.5 -translate-y-1/2 ${
                            steps[i - 1]?.done ? "bg-primary" : "bg-muted"
                          }`}
                          style={{ zIndex: 0 }}
                        />
                      )}
                      <div className="relative z-10">
                        {step.done ? (
                          <FaCheckCircle className="w-6 h-6 text-primary" />
                        ) : step.current ? (
                          <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center animate-pulse">
                            <FaCircle className="w-2 h-2 text-secondary-foreground" />
                          </div>
                        ) : (
                          <FaCircle className="w-6 h-6 text-muted" />
                        )}
                      </div>
                      <span
                        className={`text-[10px] mt-1 text-center ${
                          step.done || step.current ? "text-foreground font-medium" : "text-muted-foreground"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-destructive/10 rounded-card p-4 flex items-center gap-3">
                <FaTimesCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive font-medium">This order has been cancelled.</p>
              </div>
            )}

            {/* Delivery status */}
            <div className="bg-card rounded-card shadow-card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <FaMotorcycle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Delivery status</p>
                <p className="text-xs text-muted-foreground">{statusLabel(order.status)}</p>
              </div>
            </div>

            {/* Delivery address */}
            {order.addressSnapshot && (() => {
              try {
                const addr = JSON.parse(order.addressSnapshot) as { display?: string; label?: string };
                return (
                  <div className="bg-card rounded-card shadow-card p-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      Delivering to
                    </p>
                    <p className="text-sm text-foreground">{addr.display ?? addr.label ?? order.addressSnapshot}</p>
                  </div>
                );
              } catch {
                return null;
              }
            })()}

            {/* Order items */}
            <div className="bg-card rounded-card shadow-card p-4">
              <h3 className="text-sm font-bold text-foreground mb-3">Order Items</h3>
              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.productName} × {item.quantity}
                    </span>
                    <span className="text-foreground">₹{item.lineTotal}</span>
                  </div>
                ))}
                <div className="border-t border-border pt-2 space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Delivery</span>
                    <span>{order.deliveryFee === 0 ? "FREE" : `₹${order.deliveryFee}`}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Taxes</span>
                    <span>₹{order.taxes}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-xs text-success">
                      <span>Discount</span>
                      <span>-₹{order.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold pt-1">
                    <span className="text-foreground">Total</span>
                    <span className="text-primary">₹{order.total}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment info */}
            <div className="bg-card rounded-card shadow-card p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment</span>
                <span className="font-medium text-foreground uppercase">{order.paymentMode}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">Placed on</span>
                <span className="text-foreground">
                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default OrderTracking;
