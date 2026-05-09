import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type StoreType, storeTypes } from "@/data/mockData";
import { catalogKeys, fetchStoreCategories, fetchStoreProducts } from "@/lib/catalogApi";
import { customerKeys, fetchRestaurants } from "@/lib/customerApi";
import CustomerHeader from "@/components/customer/CustomerHeader";
import StoreTabs from "@/components/customer/StoreTabs";
import SearchBar from "@/components/customer/SearchBar";
import CategoryPills from "@/components/customer/CategoryPills";
import HeroBanner from "@/components/customer/HeroBanner";
import ProductCard from "@/components/customer/ProductCard";
import FloatingCartBar from "@/components/customer/FloatingCartBar";
import BottomNav from "@/components/customer/BottomNav";
import { FaArrowRight, FaFire, FaBolt, FaPercentage, FaStar, FaUtensils, FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { clearAccessToken, getAccessToken } from "@/lib/api";
import { fetchMyProfile } from "@/lib/userProfile";

const Index = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [store, setStore] = useState<StoreType>("food");
  const [category, setCategory] = useState("all");

  const { data: storeCats = [] } = useQuery({
    queryKey: catalogKeys.categories(store),
    queryFn: () => fetchStoreCategories(store),
    staleTime: 5 * 60 * 1000,
  });
  const { data: storeProducts = [] } = useQuery({
    queryKey: catalogKeys.products(store),
    queryFn: () => fetchStoreProducts(store),
    staleTime: 5 * 60 * 1000,
  });
  const { data: foodRestaurants = [] } = useQuery({
    queryKey: customerKeys.restaurants("food"),
    queryFn: () => fetchRestaurants("food"),
    staleTime: 5 * 60 * 1000,
  });
  const filtered = category === "all" ? storeProducts : storeProducts.filter((p) => p.categorySlug === category);

  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    if (!isMobile) return;
    const seen = sessionStorage.getItem("naniui_skeleton_seen");
    if (seen) return;
    setShowSkeleton(true);
    const t = window.setTimeout(() => {
      setShowSkeleton(false);
      sessionStorage.setItem("naniui_skeleton_seen", "1");
    }, 650);
    return () => window.clearTimeout(t);
  }, [isMobile]);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const profile = await fetchMyProfile();
        if (cancelled) return;
        if (!profile) {
          clearAccessToken();
          navigate("/auth", { replace: true });
          return;
        }
        if (!profile.onboardingCompleted) {
          navigate("/onboarding", { replace: true });
        }
      } catch { /* network error — stay on home */ }
    })();
    return () => { cancelled = true; };
  }, [navigate]);

  const handleStoreChange = (s: StoreType) => {
    if (s === "food") {
      setStore("food");
      setCategory("all");
      return;
    }
    navigate(`/store/${s}`);
  };

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-8">
      <CustomerHeader store={store} onStoreChange={handleStoreChange} />
      <StoreTabs active={store} onChange={handleStoreChange} />
      <SearchBar store={store} floating />
      <HeroBanner store={store} />
      <CategoryPills categories={storeCats} active={category} onChange={setCategory} />

      {/* Horizontal restaurants strip */}
      {store === "food" && (
        <section className="px-4 pt-1 pb-3 lg:px-10 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[13px] font-bold text-foreground flex items-center gap-1.5">
              <FaUtensils className="w-3.5 h-3.5 text-primary" /> Restaurants
            </h3>
            <Link to="/restaurants" className="text-[11px] font-semibold text-primary">
              View all
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
            {foodRestaurants.map((r) => (
              <Link
                key={r.id}
                to={`/restaurant/${r.id}`}
                className="min-w-[200px] max-w-[200px] bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.07)] overflow-hidden active:scale-[0.98] transition-transform"
              >
                <div className="relative">
                  <img src={r.image} alt={r.name} className="w-full h-24 object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white truncate">{r.name}</span>
                    {r.rating && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-white bg-black/30 px-1.5 py-0.5 rounded-full">
                        <FaStar className="w-2.5 h-2.5 text-yellow-400" /> {r.rating}
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-2.5">
                  <p className="text-[11px] text-muted-foreground truncate">{r.cuisineTypes}</p>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    {r.eta && <span className="text-[10px] font-medium text-muted-foreground">{r.eta}</span>}
                    {r.offer && <span className="text-[10px] font-bold text-[#4CAF50] truncate">{r.offer}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Quick Actions */}
      {category === "all" && (
        <section className="px-4 py-2 lg:px-10 max-w-7xl mx-auto">
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-violet-50 rounded-2xl p-3 text-center cursor-pointer hover:bg-violet-100 transition-colors active:scale-[0.97]">
              <FaBolt className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-[11px] font-semibold text-foreground">Flash Sale</p>
            </div>
            <div className="bg-green-50 rounded-2xl p-3 text-center cursor-pointer hover:bg-green-100 transition-colors active:scale-[0.97]">
              <FaPercentage className="w-5 h-5 text-green-600 mx-auto mb-1" />
              <p className="text-[11px] font-semibold text-foreground">Best Deals</p>
            </div>
            <div className="bg-fuchsia-50 rounded-2xl p-3 text-center cursor-pointer hover:bg-fuchsia-100 transition-colors active:scale-[0.97]">
              <FaFire className="w-5 h-5 text-fuchsia-600 mx-auto mb-1" />
              <p className="text-[11px] font-semibold text-foreground">Trending</p>
            </div>
          </div>
        </section>
      )}

      {/* Products Grid */}
      <section className="px-4 py-3 lg:px-10 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15px] font-bold text-foreground">
            {category === "all" ? "Popular Right Now" : storeCats.find(c => c.id === category)?.label}
          </h2>
          <Link to="/search/food" className="flex items-center gap-1 text-[11px] text-primary font-semibold">
            View All <FaArrowRight className="w-2.5 h-2.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {showSkeleton
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={`sk-${i}`} className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.07)] p-2.5">
                  <Skeleton className="aspect-square w-full rounded-xl" />
                  <div className="mt-2 space-y-2">
                    <Skeleton className="h-4 w-4/5 rounded-md" />
                    <Skeleton className="h-3 w-2/3 rounded-md" />
                    <div className="flex items-center justify-between pt-1">
                      <Skeleton className="h-4 w-16 rounded-md" />
                      <Skeleton className="h-8 w-14 rounded-lg" />
                    </div>
                  </div>
                </div>
              ))
            : filtered.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FaSearch className="w-6 h-6 text-primary mb-4" />
            <h3 className="text-base font-bold text-foreground">No products found</h3>
            <p className="text-sm text-muted-foreground mt-1">Try a different category</p>
          </div>
        )}
      </section>

      {/* Deals Section */}
      {category === "all" && (
        <section className="px-4 py-2 lg:px-10 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-bold text-foreground flex items-center gap-1.5">
              <FaFire className="w-4 h-4 text-green-600" /> Deals for You
            </h2>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {storeProducts.slice(0, 4).map((product) => (
              <div key={`deal-${product.id}`} className="min-w-[156px] max-w-[156px]">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>
      )}

      {category === "all" && store === "food" && (
        <section className="px-4 py-2 lg:px-10 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-bold text-foreground flex items-center gap-1.5">
              <FaUtensils className="w-4 h-4 text-primary" /> Restaurants Near You
            </h2>
            <Link to="/restaurants" className="flex items-center gap-1 text-[11px] text-primary font-semibold">
              View All <FaArrowRight className="w-2.5 h-2.5" />
            </Link>
          </div>
          <div className="space-y-2.5">
            {foodRestaurants.slice(0, 3).map((restaurant) => (
              <Link key={restaurant.id} to={`/restaurant/${restaurant.id}`} className="flex gap-3 bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.07)] p-3 active:scale-[0.99] transition-transform">
                <img src={restaurant.image} alt={restaurant.name} className="w-20 h-20 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-[13px] font-bold text-foreground truncate">{restaurant.name}</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{restaurant.cuisineTypes}</p>
                  {restaurant.offer && <p className="text-[11px] text-primary font-semibold mt-2">{restaurant.offer}</p>}
                </div>
                {restaurant.eta && <div className="text-[11px] text-muted-foreground whitespace-nowrap">{restaurant.eta}</div>}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Top Rated */}
      {category === "all" && (
        <section className="px-4 py-3 lg:px-10 max-w-7xl mx-auto">
          <h2 className="text-[15px] font-bold text-foreground mb-3 flex items-center gap-1.5">
            <FaStar className="w-4 h-4 text-yellow-500" /> Top Rated
          </h2>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {storeProducts.sort((a, b) => b.rating - a.rating).slice(0, 5).map((product) => (
              <div key={`top-${product.id}`} className="min-w-[156px] max-w-[156px] shrink-0">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>
      )}

      <FloatingCartBar />
      <BottomNav />
    </div>
  );
};

export default Index;
