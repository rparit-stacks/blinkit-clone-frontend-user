import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { FaChevronLeft, FaClock, FaStar } from "react-icons/fa";
import ProductCard from "@/components/customer/ProductCard";
import BottomNav from "@/components/customer/BottomNav";
import FloatingCartBar from "@/components/customer/FloatingCartBar";
import { catalogKeys, fetchRestaurantProducts, fetchStoreById } from "@/lib/catalogApi";
import { customerKeys } from "@/lib/customerApi";

const RestaurantPage = () => {
  const { restaurantId } = useParams();
  const [searchParams] = useSearchParams();
  const selectedFoodId = searchParams.get("food");

  const { data: restaurant, isLoading: rLoading, isError: rError } = useQuery({
    queryKey: customerKeys.restaurant(restaurantId ?? ""),
    queryFn: () => fetchStoreById(restaurantId!),
    enabled: !!restaurantId,
  });

  const { data: menuItems = [] } = useQuery({
    queryKey: catalogKeys.restaurantProducts(restaurantId ?? ""),
    queryFn: () => fetchRestaurantProducts(restaurantId!),
    enabled: !!restaurantId,
    staleTime: 5 * 60 * 1000,
  });

  const highlightedFood = selectedFoodId ? menuItems.find((item) => item.id === selectedFoodId) : null;

  if (rLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">Loading restaurant…</p>
      </div>
    );
  }

  if (rError || !restaurant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-lg font-bold text-foreground">Restaurant not found</h2>
          <Link to="/restaurants" className="text-primary text-sm mt-2 inline-block">
            Back to Restaurants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-page bg-background">
      <header className="sticky top-0 z-50 bg-[#F7F3FF] border-b border-violet-100/60 px-4 py-3 flex items-center gap-3">
        <Link
          to="/restaurants"
          className="w-9 h-9 rounded-full bg-white/90 border border-violet-100 flex items-center justify-center text-foreground"
        >
          <FaChevronLeft className="w-3.5 h-3.5" />
        </Link>
        <h1 className="text-base font-bold text-foreground truncate">{restaurant.name}</h1>
      </header>

      <section className="max-w-6xl mx-auto">
        <img src={restaurant.image} alt={restaurant.name} className="w-full h-52 object-cover" />
        <div className="px-4 py-4 space-y-2">
          <h2 className="text-xl font-bold text-foreground">{restaurant.name}</h2>
          <p className="text-sm text-muted-foreground">{restaurant.cuisineTypes}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {restaurant.rating && (
              <span className="inline-flex items-center gap-1 text-success font-semibold">
                <FaStar className="w-3 h-3" />
                {restaurant.rating}
              </span>
            )}
            {restaurant.eta && (
              <span className="inline-flex items-center gap-1">
                <FaClock className="w-3 h-3 text-primary" />
                {restaurant.eta}
              </span>
            )}
            {restaurant.offer && <span className="text-primary font-medium">{restaurant.offer}</span>}
          </div>
        </div>
      </section>

      {highlightedFood && (
        <section className="max-w-6xl mx-auto px-4">
          <div className="bg-primary/10 border border-primary/20 rounded-card p-3 mb-4">
            <p className="text-xs text-primary font-semibold">Selected from search/list</p>
            <p className="text-sm font-bold text-foreground mt-0.5">{highlightedFood.name}</p>
          </div>
        </section>
      )}

      <section className="px-4 py-2 max-w-6xl mx-auto">
        <h3 className="text-sm font-bold text-foreground mb-3">Menu</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {menuItems.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {menuItems.length === 0 && (
          <p className="text-sm text-muted-foreground py-8">No menu items linked to this restaurant yet.</p>
        )}
      </section>

      <FloatingCartBar />
      <BottomNav />
    </div>
  );
};

export default RestaurantPage;
