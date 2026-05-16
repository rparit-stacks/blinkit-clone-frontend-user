import { FaChevronLeft, FaCheckDouble, FaCircle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import BottomNav from "@/components/customer/BottomNav";
import {
  customerKeys,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/customerApi";
import { resolveNotificationPath } from "@/lib/notificationNavigation";

const Notifications = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: items = [], isLoading, isError, error } = useQuery({
    queryKey: customerKeys.notifications(),
    queryFn: fetchNotifications,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });

  const markOne = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: customerKeys.notifications() }),
  });

  const markAll = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: customerKeys.notifications() }),
  });

  return (
    <div className="mobile-page bg-background">
      <header className="sticky top-0 z-50 bg-[#F7F3FF] border-b border-violet-100/60 px-4 py-3 flex items-center gap-3">
        <Link
          to="/profile"
          className="w-9 h-9 rounded-full bg-white/90 border border-violet-100 flex items-center justify-center text-foreground"
        >
          <FaChevronLeft className="w-3.5 h-3.5" />
        </Link>
        <h1 className="text-base font-bold text-foreground flex-1">Notifications</h1>
        <button
          type="button"
          disabled={markAll.isPending || items.length === 0}
          onClick={() => markAll.mutate()}
          className="flex items-center gap-1 text-xs text-primary font-medium disabled:opacity-50"
        >
          <FaCheckDouble className="w-3 h-3" /> Mark all read
        </button>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-2">
        {isLoading && <p className="text-sm text-muted-foreground text-center py-8">Loading…</p>}
        {isError && (
          <p className="text-sm text-destructive text-center py-8">
            {error instanceof Error ? error.message : "Failed to load"}
          </p>
        )}
        {!isLoading &&
          !isError &&
          items.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => {
                if (!n.read) markOne.mutate(n.id);
                const path = resolveNotificationPath({
                  relatedEntityKind: n.relatedEntityKind,
                  relatedEntityId: n.relatedEntityId,
                });
                if (path !== "/notifications") navigate(path);
              }}
              className={`w-full text-left bg-card rounded-card shadow-card p-4 flex gap-3 ${!n.read ? "border-l-4 border-primary" : ""}`}
            >
              <div className="pt-1">
                {!n.read && <FaCircle className="w-2 h-2 text-primary" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-foreground">{n.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{n.time}</p>
              </div>
            </button>
          ))}
        {!isLoading && !isError && items.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-12">No notifications yet.</p>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Notifications;
