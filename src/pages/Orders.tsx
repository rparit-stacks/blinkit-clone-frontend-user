import { FaChevronLeft } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import BottomNav from "@/components/customer/BottomNav";
import { fetchMyOrders, orderKeys } from "@/lib/cartApi";

const statusColors: Record<string, string> = {
  DELIVERED: "bg-success/10 text-success",
  PROCESSING: "bg-secondary/20 text-secondary-foreground",
  CANCELLED: "bg-destructive/10 text-destructive",
  DISPATCHED: "bg-primary/10 text-primary",
  PENDING: "bg-yellow-100 text-yellow-700",
  PAID: "bg-blue-100 text-blue-700",
};

const Orders = () => {
  const { data: orders = [], isLoading, isError, error } = useQuery({
    queryKey: orderKeys.orders(),
    queryFn: fetchMyOrders,
    staleTime: 60 * 1000,
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-50 bg-[#F7F3FF] border-b border-violet-100/60 px-4 py-3 flex items-center gap-3">
        <Link
          to="/"
          className="w-9 h-9 rounded-full bg-white/90 border border-violet-100 flex items-center justify-center text-foreground"
        >
          <FaChevronLeft className="w-3.5 h-3.5" />
        </Link>
        <h1 className="text-base font-bold text-foreground">My Orders</h1>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-3">
        {isLoading && <p className="text-sm text-muted-foreground py-8 text-center">Loading orders…</p>}
        {isError && (
          <p className="text-sm text-destructive py-8 text-center">
            {error instanceof Error ? error.message : "Could not load orders"}
          </p>
        )}

        {!isLoading && !isError && orders.map((order) => (
          <Link
            key={order.id}
            to={`/order-tracking/${encodeURIComponent(order.id)}`}
            className="block bg-card rounded-card shadow-card p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-foreground">#{order.id.slice(0, 8)}…</span>
              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-pill ${statusColors[order.status] ?? statusColors.PROCESSING}`}
              >
                {order.status.replace("_", " ")}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
            <div className="space-y-1">
              {order.items.slice(0, 3).map((item, i) => (
                <p key={i} className="text-sm text-foreground">
                  {item.productName} × {item.quantity}
                </p>
              ))}
              {order.items.length > 3 && (
                <p className="text-xs text-muted-foreground">+{order.items.length - 3} more items</p>
              )}
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <span className="text-sm font-bold text-primary">₹{order.total}</span>
              <span className="text-xs text-muted-foreground">{order.paymentMode.toUpperCase()}</span>
            </div>
          </Link>
        ))}

        {!isLoading && !isError && orders.length === 0 && (
          <div className="text-center py-16">
            <span className="text-5xl">📦</span>
            <h3 className="text-base font-bold text-foreground mt-4">No orders yet</h3>
            <p className="text-sm text-muted-foreground mt-1">Start shopping to see your orders here</p>
            <Link to="/" className="mt-4 inline-block text-primary text-sm font-medium">Browse Products</Link>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Orders;
