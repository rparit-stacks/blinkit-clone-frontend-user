import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaArrowRight, FaStore } from "react-icons/fa";
import CustomerHeader from "@/components/customer/CustomerHeader";
import StoreTabs from "@/components/customer/StoreTabs";
import SearchBar from "@/components/customer/SearchBar";
import HeroBanner from "@/components/customer/HeroBanner";
import CategoryPills from "@/components/customer/CategoryPills";
import ProductCard from "@/components/customer/ProductCard";
import BottomNav from "@/components/customer/BottomNav";
import FloatingCartBar from "@/components/customer/FloatingCartBar";
import { type StoreType, storeTypes } from "@/data/mockData";
import { catalogKeys, fetchStoreCategories, fetchStoreProducts } from "@/lib/catalogApi";
import PartnerStoresSection from "@/components/customer/PartnerStoresSection";

const isStoreType = (value: string | undefined): value is StoreType =>
  !!value && storeTypes.some((store) => store.id === value);
const normalizeStoreId = (value: string | undefined) => (value === "bazar" ? "bazaar" : value);

const StorePage = () => {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState("all");
  const normalizedStoreId = normalizeStoreId(storeId);
  const storeValid = isStoreType(normalizedStoreId);
  const catalogStore: StoreType = storeValid ? normalizedStoreId : "food";

  const { data: storeCats = [] } = useQuery({
    queryKey: catalogKeys.categories(catalogStore),
    queryFn: () => fetchStoreCategories(catalogStore),
    enabled: storeValid,
    staleTime: 5 * 60 * 1000,
  });
  const { data: storeProducts = [] } = useQuery({
    queryKey: catalogKeys.products(catalogStore),
    queryFn: () => fetchStoreProducts(catalogStore),
    enabled: storeValid,
    staleTime: 5 * 60 * 1000,
  });

  if (!storeValid) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-lg font-bold text-foreground">Store not found</h2>
          <Link to="/" className="text-primary text-sm mt-2 inline-block">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  const store = normalizedStoreId;
  const filteredProducts = useMemo(
    () => (category === "all" ? storeProducts : storeProducts.filter((item) => item.categorySlug === category)),
    [category, storeProducts]
  );
  const storeName = storeTypes.find((item) => item.id === store)?.label || "Store";

  const handleStoreChange = (nextStore: StoreType) => {
    if (nextStore === "food") {
      navigate("/");
      return;
    }
    navigate(`/store/${nextStore}`);
  };

  return (
    <div className="mobile-page bg-background">
      <CustomerHeader store={store} onStoreChange={handleStoreChange} />
      <StoreTabs active={store} onChange={handleStoreChange} />
      <SearchBar store={store} floating />
      <HeroBanner store={store} />
      <CategoryPills categories={storeCats} active={category} onChange={setCategory} />

      {store === "food" && (
        <section className="px-4 py-3 max-w-7xl mx-auto">
          <Link
            to="/restaurants"
            className="rounded-card bg-card shadow-card p-4 flex items-center justify-between hover:-translate-y-0.5 transition-transform"
          >
            <div>
              <p className="text-xs text-muted-foreground">Discover nearby places</p>
              <h3 className="text-base font-bold text-foreground mt-1">Browse Restaurants</h3>
            </div>
            <div className="inline-flex items-center gap-2 text-primary font-semibold text-sm">
              <FaStore className="w-4 h-4" />
              View
              <FaArrowRight className="w-3 h-3" />
            </div>
          </Link>
        </section>
      )}

      {/* Partner stores for this category */}
      {store !== "food" && (
        <PartnerStoresSection
          store={store}
          title={`${storeName} Partner Stores`}
        />
      )}

      <section className="px-4 py-2 max-w-7xl mx-auto">
        <h2 className="text-lg font-bold text-foreground mb-3">
          {category === "all" ? `${storeName} Highlights` : storeCats.find((cat) => cat.id === category)?.label}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <FloatingCartBar />
      <BottomNav />
    </div>
  );
};

export default StorePage;
