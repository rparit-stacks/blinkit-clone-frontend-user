import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useNavigate, useParams } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import Wishlist from "./pages/Wishlist";
import { useIsMobile } from "@/hooks/use-mobile";
import { haptic } from "@/lib/haptics";
import NativeLocationPrompt from "@/components/customer/NativeLocationPrompt";
import { onNativeDeepLink } from "@/lib/nativeApp";
import { getAccessToken } from "@/lib/api";
import { initPushNotifications, subscribeNativePushTokenRefresh } from "@/lib/pushNotifications";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import SearchPage from "./pages/SearchPage";
import ProductDetail from "./pages/ProductDetail";
import CartPage from "./pages/CartPage";
import Checkout from "./pages/Checkout";
import PaymentPage from "./pages/PaymentPage";
import OrderTracking from "./pages/OrderTracking";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Addresses from "./pages/Addresses";
import AddressAdd from "./pages/AddressAdd";
import Onboarding from "./pages/Onboarding";
import Notifications from "./pages/Notifications";
import StorePage from "./pages/StorePage";
import RestaurantList from "./pages/RestaurantList";
import RestaurantPage from "./pages/RestaurantPage";
import StoresListPage from "./pages/StoresListPage";
import PartnerStoreCatalogPage from "./pages/PartnerStoreCatalogPage";

const queryClient = new QueryClient();

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const token = getAccessToken();
  if (!token) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

/** Legacy /store/:storeId/order-tracking[/:orderId] → unified routes */
const OrderTrackingLegacyRedirect = () => {
  const { orderId } = useParams();
  if (orderId) return <Navigate to={`/order-tracking/${orderId}`} replace />;
  return <Navigate to="/orders" replace />;
};

const AppContent = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  useEffect(() => {
    if (getAccessToken()) {
      initPushNotifications().catch(() => {});
    }
    const unsubNative = subscribeNativePushTokenRefresh();
    const go = (path: string) => {
      if (path.startsWith("/")) navigate(path);
    };
    const onPushNavigate = (e: Event) => {
      const path = (e as CustomEvent<{ path: string }>).detail?.path;
      if (path) go(path);
    };
    window.addEventListener("naini-notification-navigate", onPushNavigate);
    const unsubDeepLink = onNativeDeepLink(go);
    return () => {
      unsubNative();
      unsubDeepLink();
      window.removeEventListener("naini-notification-navigate", onPushNavigate);
    };
  }, [navigate]);

  useEffect(() => {
    const onPointerUp = (e: PointerEvent) => {
      // Only on mobile, only primary button/touch
      if (!isMobile) return;
      if (e.button !== 0) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;
      // Only when an interactive element is tapped/clicked
      const interactive = target.closest("button, a, [role='button'], [data-haptic]");
      if (!interactive) return;
      // Avoid vibrating on disabled
      if ((interactive as HTMLButtonElement).disabled) return;
      haptic(12, "light");
    };
    window.addEventListener("pointerup", onPointerUp);
    return () => window.removeEventListener("pointerup", onPointerUp);
  }, [isMobile]);

  return (
    <>
      <NativeLocationPrompt />
      <Toaster />
      <Sonner />
      <Routes>
          <Route
            path="/"
            element={
              <RequireAuth>
                <Index />
              </RequireAuth>
            }
          />
          <Route path="/auth" element={<Auth />} />
          <Route path="/login" element={<Navigate to="/auth" replace />} />
          <Route path="/signup" element={<Navigate to="/auth" replace />} />
          <Route path="/search" element={<Navigate to="/search/food" replace />} />
          <Route path="/search/:storeId" element={<SearchPage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          {/* Unified cart / checkout / payment / orders routes (no storeId prefix) */}
          <Route path="/cart" element={<CartPage />} />
          <Route
            path="/checkout"
            element={
              <RequireAuth>
                <Checkout />
              </RequireAuth>
            }
          />
          <Route
            path="/payment"
            element={
              <RequireAuth>
                <PaymentPage />
              </RequireAuth>
            }
          />
          <Route
            path="/orders"
            element={
              <RequireAuth>
                <Orders />
              </RequireAuth>
            }
          />
          <Route
            path="/order-tracking/:orderId"
            element={
              <RequireAuth>
                <OrderTracking />
              </RequireAuth>
            }
          />
          {/* Legacy per-store routes → redirect to unified */}
          <Route path="/store/:storeId/cart" element={<Navigate to="/cart" replace />} />
          <Route path="/store/:storeId/checkout" element={<Navigate to="/checkout" replace />} />
          <Route path="/store/:storeId/payment" element={<Navigate to="/payment" replace />} />
          <Route path="/store/:storeId/orders" element={<Navigate to="/orders" replace />} />
          <Route path="/store/:storeId/order-tracking" element={<OrderTrackingLegacyRedirect />} />
          <Route path="/store/:storeId/order-tracking/:orderId" element={<OrderTrackingLegacyRedirect />} />
          <Route path="/store/:storeId" element={<StorePage />} />
          <Route path="/restaurants" element={<RestaurantList />} />
          <Route path="/restaurant/:restaurantId" element={<RestaurantPage />} />
          <Route path="/stores" element={<StoresListPage />} />
          <Route path="/store-catalog/:storeId" element={<PartnerStoreCatalogPage />} />
          <Route
            path="/onboarding"
            element={
              <RequireAuth>
                <Onboarding />
              </RequireAuth>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />
          <Route
            path="/profile/edit"
            element={
              <RequireAuth>
                <EditProfile />
              </RequireAuth>
            }
          />
          <Route
            path="/addresses"
            element={
              <RequireAuth>
                <Addresses />
              </RequireAuth>
            }
          />
          <Route
            path="/addresses/add"
            element={
              <RequireAuth>
                <AddressAdd />
              </RequireAuth>
            }
          />
          <Route
            path="/notifications"
            element={
              <RequireAuth>
                <Notifications />
              </RequireAuth>
            }
          />
          <Route path="/wishlist" element={<RequireAuth><Wishlist /></RequireAuth>} />
          <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <WishlistProvider>
        <TooltipProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </WishlistProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
