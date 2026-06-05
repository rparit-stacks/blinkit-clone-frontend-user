import { useState } from "react";
import { FaChevronDown, FaUser, FaBell, FaSearch, FaArrowRight, FaMapMarkerAlt, FaBolt } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchNotifications } from "@/lib/notificationsApi";
import { StoreType, storeTypes } from "@/data/mockData";
import storeFood from "@/assets/store-food.png";
import storeBazaar from "@/assets/store-bazaar.png";
import storeElectronic from "@/assets/store-electronic.png";
import LocationPicker from "@/components/customer/LocationPicker";
import { useLocation } from "@/hooks/use-location";
import type { SavedLocation } from "@/lib/locationApi";

interface CustomerHeaderProps {
  store?: StoreType;
  onStoreChange?: (store: StoreType) => void;
}

const storeImages: Record<StoreType, string> = {
  food: storeFood,
  bazaar: storeBazaar,
  electronic: storeElectronic,
};

const storeThemes: Record<StoreType, { bg: string; subtitle: string; offer: string; arrow: string }> = {
  food: { bg: "bg-gradient-to-br from-violet-50 to-purple-100", subtitle: "FROM RESTAURANTS", offer: "UPTO 60% OFF", arrow: "bg-primary" },
  bazaar: { bg: "bg-gradient-to-br from-fuchsia-50 to-purple-100", subtitle: "LOCAL MARKET", offer: "UPTO 50% OFF", arrow: "bg-secondary" },
  electronic: { bg: "bg-gradient-to-br from-indigo-50 to-violet-100", subtitle: "GADGETS & MORE", offer: "UPTO 70% OFF", arrow: "bg-indigo-600" },
};

const storeTextColors: Record<StoreType, string> = {
  food: "text-primary",
  bazaar: "text-fuchsia-700",
  electronic: "text-indigo-700",
};

const CustomerHeader = ({ store, onStoreChange }: CustomerHeaderProps) => {
  const activeStore = store || "food";
  const [showPicker, setShowPicker] = useState(false);
  const { location, zone, setLocation } = useLocation();

  const { data: notifItems = [] } = useQuery({
    queryKey: ["customer", "notifications"],
    queryFn: fetchNotifications,
    staleTime: 60_000,
    refetchInterval: 90_000,
  });
  const unreadCount = notifItems.filter((n) => !n.read).length;

  const handleConfirm = async (loc: SavedLocation) => {
    await setLocation(loc);
    setShowPicker(false);
  };

  const eta = zone?.inZone ? (zone.etaLabel ?? "6-10 mins") : null;
  const locationLabel = location?.label ?? "Select your location";

  return (
    <>
      {/* ─── Mobile Header ─── */}
      <header className="sticky top-0 z-50 lg:hidden bg-[#F7F3FF] border-b border-gray-100">
        <div className="relative flex items-center justify-between px-4 py-3 overflow-hidden bg-[#F7F3FF]">
          {/* Left: Delivery time + address */}
          <button
            type="button"
            className="flex flex-col min-w-0 cursor-pointer text-left"
            onClick={() => setShowPicker(true)}
          >
            <div className="flex items-center gap-1">
              <FaBolt className="w-3.5 h-3.5 text-foreground" />
              <span className="text-[15px] font-extrabold text-foreground leading-tight">
                {eta ?? "Tap to set location"}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <FaMapMarkerAlt className="w-3 h-3 text-primary flex-shrink-0" />
              <span className="text-[12px] text-muted-foreground truncate max-w-[180px]">
                {locationLabel}
              </span>
              <FaChevronDown className="w-2.5 h-2.5 text-muted-foreground flex-shrink-0" />
            </div>
          </button>

          {/* Right: Notification + Profile */}
          <div className="relative z-10 flex items-center gap-2 flex-shrink-0">
            <Link
              to="/notifications"
              className="relative w-9 h-9 rounded-full bg-white/80 flex items-center justify-center"
            >
              <FaBell className="w-3.5 h-3.5 text-primary" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
            <Link
              to="/profile"
              className="w-9 h-9 rounded-full bg-white/80 flex items-center justify-center"
            >
              <FaUser className="w-3.5 h-3.5 text-primary" />
            </Link>
          </div>
        </div>

        {/* Out-of-zone banner */}
        {zone && !zone.inZone && (
          <div className="bg-red-50 border-t border-red-100 px-4 py-1.5 text-center">
            <p className="text-[11px] font-medium text-red-600">{zone.message}</p>
          </div>
        )}
      </header>

      {/* ─── Desktop Header ─── */}
      <header className="hidden lg:block">
        <div className="bg-gradient-to-r from-[#4B0082] to-[#7C3AED]">
          <div className="max-w-7xl mx-auto px-10 py-4 flex items-center justify-between">
            <img src="/naini-store-logo.png" alt="NainiStore" className="h-9 object-contain" />
            <nav className="flex items-center gap-6">
              <Link to={`/store/${activeStore}/orders`} className="text-sm font-medium text-primary-foreground/80 hover:text-primary-foreground transition-colors">My Orders</Link>
              <Link to={`/search/${activeStore}`} className="text-sm font-medium text-primary-foreground/80 hover:text-primary-foreground transition-colors">Search</Link>
              <Link to="/profile" className="text-sm font-medium text-primary-foreground/80 hover:text-primary-foreground transition-colors">Profile</Link>
              <Link to="/auth" className="px-5 py-2 bg-black text-white rounded-lg text-sm font-bold shadow-[0_0_16px_rgba(108,58,210,0.35)] hover:opacity-90 transition-opacity">Sign in</Link>
            </nav>
          </div>
        </div>

        {/* Hero with pattern */}
        <div className="bg-gradient-to-r from-[#4B0082] to-[#7C3AED] relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
          <div className="relative max-w-7xl mx-auto px-10 py-10 text-center">
            <h1 className="text-3xl lg:text-4xl font-extrabold text-primary-foreground italic leading-tight">
              Order food & essentials.<br />Discover best deals. Swift it!
            </h1>
            <div className="flex items-center justify-center gap-4 mt-8 max-w-2xl mx-auto">
              <button
                type="button"
                onClick={() => setShowPicker(true)}
                className="flex items-center gap-2 bg-card rounded-lg px-4 h-12 flex-1 max-w-[280px] shadow-sm"
              >
                <FaMapMarkerAlt className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm text-foreground truncate">{locationLabel}</span>
                <FaChevronDown className="w-3 h-3 text-muted-foreground ml-auto flex-shrink-0" />
              </button>
              <Link to={`/search/${activeStore}`} className="flex items-center gap-2 bg-card rounded-lg px-4 h-12 flex-1 max-w-[320px] shadow-sm">
                <span className="text-sm text-muted-foreground flex-1">Search for restaurant, item or more</span>
                <FaSearch className="w-4 h-4 text-muted-foreground" />
              </Link>
            </div>
            {zone && !zone.inZone && (
              <p className="mt-3 text-sm font-medium text-red-200">{zone.message}</p>
            )}
          </div>
        </div>

        {/* Store Category Cards */}
        {onStoreChange && (
          <div className="bg-gradient-to-r from-[#4B0082] to-[#7C3AED] relative overflow-hidden pb-10">
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
            <div className="relative max-w-5xl mx-auto px-10 grid grid-cols-3 gap-6">
              {storeTypes.map((s) => {
                const theme = storeThemes[s.id];
                const isActive = store === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => onStoreChange(s.id)}
                    className={`${theme.bg} rounded-3xl p-6 flex flex-col items-start relative overflow-hidden group hover:shadow-xl transition-all min-h-[200px] ${
                      isActive ? "ring-3 ring-white/50 shadow-xl scale-[1.02]" : "hover:scale-[1.01]"
                    }`}
                  >
                    <h3 className="text-xl font-extrabold text-foreground uppercase tracking-wide">
                      {s.label === "Food" ? "FOOD DELIVERY" : s.label.toUpperCase()}
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5 uppercase tracking-wider">{theme.subtitle}</p>
                    <span className={`text-xs font-bold mt-3 ${storeTextColors[s.id]}`}>{theme.offer}</span>
                    <div className="mt-auto">
                      <div className={`w-9 h-9 rounded-full ${theme.arrow} flex items-center justify-center mt-4 group-hover:scale-110 transition-transform`}>
                        <FaArrowRight className="w-3.5 h-3.5 text-primary-foreground" />
                      </div>
                    </div>
                    <img
                      src={storeImages[s.id]}
                      alt={s.label}
                      className="absolute bottom-2 right-2 w-28 h-28 object-contain opacity-90 group-hover:scale-110 transition-transform"
                      width={128}
                      height={128}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Location Picker overlay */}
      {showPicker && (
        <LocationPicker
          initial={location}
          inZone={zone?.inZone ?? null}
          onConfirm={(loc) => void handleConfirm(loc)}
          onClose={() => setShowPicker(false)}
        />
      )}
    </>
  );
};

export default CustomerHeader;
