import { FaHome, FaClipboardList, FaSearch, FaUser } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";

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
  const navItems = [
    { icon: FaHome, label: "Home", path: store === "food" ? "/" : `/store/${store}` },
    { icon: FaClipboardList, label: "Orders", path: "/orders" },
    { icon: FaSearch, label: "Search", path: `/search/${store}` },
    { icon: FaUser, label: "Profile", path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-gray-100">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const isActive =
            item.label === "Search"
              ? location.pathname.startsWith("/search")
              : item.label === "Orders"
              ? location.pathname.startsWith("/orders") || location.pathname.startsWith("/order-tracking")
              : location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center gap-0.5 py-1.5 px-3"
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-gray-400"}`} />
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
