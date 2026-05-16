import { FaHome, FaClipboardList, FaSearch, FaUser, FaHeart } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { useWishlist } from "@/context/WishlistContext";

const getActiveStoreFromPath = (pathname: string) => {
  const match = pathname.match(/^\/store\/([^/]+)/);
  const store = match?.[1];
  if (store === "bazar") return "bazaar";
  if (store === "food" || store === "bazaar" || store === "electronic") return store;
  return "food";
};

const BottomNav = () => {
  const location = useLocation();
  const store = getActiveStoreFromPath(location.pathname);
  const { wishlistedIds } = useWishlist();

  const navItems = [
    { icon: FaHome,          label: "Home",    path: store === "food" ? "/" : `/store/${store}` },
    { icon: FaClipboardList, label: "Orders",  path: "/orders" },
    { icon: FaSearch,        label: "Search",  path: `/search/${store}` },
    { icon: FaHeart,         label: "Wishlist",path: "/wishlist" },
    { icon: FaUser,          label: "Profile", path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-gray-100 shadow-[var(--shadow-bottom-nav)]">
      <div className="flex items-center justify-around h-14 min-h-[3.5rem]">
        {navItems.map((item) => {
          const isActive =
            item.label === "Search"
              ? location.pathname.startsWith("/search")
              : item.label === "Orders"
              ? location.pathname.startsWith("/orders") || location.pathname.startsWith("/order-tracking")
              : item.label === "Wishlist"
              ? location.pathname === "/wishlist"
              : location.pathname === item.path;

          const showBadge = item.label === "Wishlist" && wishlistedIds.size > 0;

          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center justify-center gap-0.5 py-1.5 px-3"
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : item.label === "Wishlist" && wishlistedIds.size > 0 ? "text-red-400" : "text-gray-400"}`} />
              {showBadge && (
                <span className="absolute -top-0.5 right-1.5 min-w-[14px] h-3.5 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white px-0.5">
                  {wishlistedIds.size > 9 ? "9+" : wishlistedIds.size}
                </span>
              )}
              <span className={`text-[10px] font-semibold ${isActive ? "text-primary" : "text-gray-400"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
