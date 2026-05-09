import { useEffect, useRef, useState } from "react";

type PullToRefreshProps = {
  enabled?: boolean;
};

const THRESHOLD_PX = 84;
const MAX_PULL_PX = 140;

export default function PullToRefresh({ enabled = true }: PullToRefreshProps) {
  const startYRef = useRef<number | null>(null);
  const pullingRef = useRef(false);
  const [pullPx, setPullPx] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const onTouchStart = (e: TouchEvent) => {
      if (refreshing) return;
      if (window.scrollY > 0) return;
      if (e.touches.length !== 1) return;
      startYRef.current = e.touches[0].clientY;
      pullingRef.current = true;
      setPullPx(0);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!pullingRef.current) return;
      if (refreshing) return;
      if (window.scrollY > 0) return;
      if (startYRef.current == null) return;
      const dy = e.touches[0].clientY - startYRef.current;
      if (dy <= 0) {
        setPullPx(0);
        return;
      }
      // Prevent native overscroll bounce while pulling
      e.preventDefault();
      const eased = Math.min(MAX_PULL_PX, dy * 0.55);
      setPullPx(eased);
    };

    const onTouchEnd = () => {
      if (!pullingRef.current) return;
      pullingRef.current = false;
      startYRef.current = null;

      if (refreshing) return;
      if (pullPx >= THRESHOLD_PX) {
        setRefreshing(true);
        setPullPx(THRESHOLD_PX);
        // Show animation briefly, then refresh like native apps.
        window.setTimeout(() => {
          window.location.reload();
        }, 450);
      } else {
        setPullPx(0);
      }
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [enabled, pullPx, refreshing]);

  const progress = Math.max(0, Math.min(1, pullPx / THRESHOLD_PX));

  return (
    <div
      aria-hidden="true"
      className="fixed left-0 right-0 top-0 z-[60] pointer-events-none"
      style={{
        transform: `translateY(${Math.max(-72, pullPx - 72)}px)`,
        transition: refreshing ? "transform 180ms ease" : pullPx === 0 ? "transform 220ms ease" : "none",
      }}
    >
      <div className="mx-auto w-fit mt-2 px-3 py-2 rounded-2xl bg-white/70 backdrop-blur-md border border-white/25 shadow-[0_14px_30px_rgba(0,0,0,0.10)] flex items-center gap-2">
        <span
          className={`ptr-spinner ${refreshing ? "ptr-spinner--spin" : ""}`}
          style={{ opacity: pullPx > 0 ? 1 : 0, transform: `scale(${0.85 + progress * 0.15})` }}
        />
        <span className="text-[12px] font-semibold text-foreground/80">
          {refreshing ? "Refreshing…" : progress >= 1 ? "Release to refresh" : "Pull to refresh"}
        </span>
      </div>
    </div>
  );
}

