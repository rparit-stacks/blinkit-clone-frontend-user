import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FaArrowLeft, FaStar, FaClock, FaTag } from "react-icons/fa";
import {
  catalogKeys,
  fetchStoreById,
  fetchRestaurantProducts,
} from "@/lib/catalogApi";
import ProductCard from "@/components/customer/ProductCard";
import FloatingCartBar from "@/components/customer/FloatingCartBar";
import BottomNav from "@/components/customer/BottomNav";

const PartnerStoreCatalogPage = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const [activeCategory, setActiveCategory] = useState("all");

  const { data: store, isLoading: storeLoading } = useQuery({
    queryKey: catalogKeys.storeDetail(storeId ?? ""),
    queryFn: () => fetchStoreById(storeId ?? ""),
    enabled: !!storeId,
    staleTime: 5 * 60 * 1000,
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: catalogKeys.restaurantProducts(storeId ?? ""),
    queryFn: () => fetchRestaurantProducts(storeId ?? ""),
    enabled: !!storeId,
    staleTime: 5 * 60 * 1000,
  });

  const categories = Array.from(new Set(products.map((p) => p.categorySlug))).filter(Boolean);
  const filtered = activeCategory === "all" ? products : products.filter((p) => p.categorySlug === activeCategory);

  if (storeLoading) {
    return (
      <div className="mobile-page bg-background">
        <div className="h-48 bg-gray-200 animate-pulse" />
        <div className="px-4 py-4 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const coverSrc = store?.coverImage ?? store?.image ?? "/naini-hero.jpg";
  const storeName = store?.name ?? "Store";

  return (
    <div className="mobile-page bg-background">
      {/* Cover header */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={coverSrc}
          alt={storeName}
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = "/naini-hero.jpg"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />

        <div className="absolute top-4 left-4">
          <Link
            to="/stores"
            className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
          >
            <FaArrowLeft className="w-4 h-4 text-white" />
          </Link>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-lg font-extrabold text-white">{storeName}</h1>
          {store?.cuisineTypes && (
            <p className="text-[11px] text-white/70 mt-0.5">{store.cuisineTypes}</p>
          )}
          <div className="flex items-center gap-3 mt-1.5">
            {store?.rating != null && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-white bg-black/30 backdrop-blur-sm px-1.5 py-0.5 rounded-full">
                <FaStar className="w-2.5 h-2.5 text-yellow-400" /> {store.rating.toFixed(1)}
              </span>
            )}
            {store?.eta && (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-white/80">
                <FaClock className="w-2.5 h-2.5" /> {store.eta}
              </span>
            )}
            {store?.offer && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-300">
                <FaTag className="w-2.5 h-2.5" /> {store.offer}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Category filter pills */}
      {categories.length > 0 && (
        <div className="px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveCategory("all")}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-colors ${
              activeCategory === "all"
                ? "bg-primary text-white"
                : "bg-gray-100 text-muted-foreground"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold capitalize transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-muted-foreground"
              }`}
            >
              {cat.replace(/-/g, " ")}
            </button>
          ))}
        </div>
      )}

      {/* Products grid */}
      <section className="px-4 py-3 pb-28">
        {productsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FaTag className="w-6 h-6 text-primary mb-3" />
            <h3 className="text-base font-bold text-foreground">No products found</h3>
            <p className="text-sm text-muted-foreground mt-1">This store has no items in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <FloatingCartBar />
      <BottomNav />
    </div>
  );
};

export default PartnerStoreCatalogPage;
