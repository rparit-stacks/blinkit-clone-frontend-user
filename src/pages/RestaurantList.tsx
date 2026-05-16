import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FaChevronLeft, FaStar, FaUtensils } from "react-icons/fa";
import BottomNav from "@/components/customer/BottomNav";
import { catalogKeys, fetchStores } from "@/lib/catalogApi";
import { customerKeys, fetchRestaurants } from "@/lib/customerApi";

const RestaurantList = () => {
  const { data: restaurantRows = [], isLoading, isError } = useQuery({
    queryKey: customerKeys.restaurants("food"),
    queryFn: () => fetchRestaurants("food"),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="mobile-page bg-background">
      <header className="sticky top-0 z-50 bg-[#F7F3FF] border-b border-violet-100/60 px-4 py-3 flex items-center gap-3">
        <Link
          to="/store/food"
          className="w-9 h-9 rounded-full bg-white/90 border border-violet-100 flex items-center justify-center text-foreground"
        >
          <FaChevronLeft className="w-3.5 h-3.5" />
        </Link>
        <h1 className="text-base font-bold text-foreground">Restaurants</h1>
      </header>

      <section className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {isLoading && <p className="text-sm text-muted-foreground">Loading restaurants…</p>}
        {isError && <p className="text-sm text-destructive">Could not load restaurants.</p>}
        {!isLoading &&
          !isError &&
          restaurantRows.map((restaurant) => (
            <Link
              key={restaurant.id}
              to={`/restaurant/${restaurant.id}`}
              className="block bg-card rounded-card shadow-card overflow-hidden hover:-translate-y-0.5 transition-transform"
            >
              <img src={restaurant.image} alt={restaurant.name} className="w-full h-36 object-cover" />
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-foreground">{restaurant.name}</h2>
                  {restaurant.rating && (
                    <div className="flex items-center gap-1 text-success text-xs font-semibold">
                      <FaStar className="w-3 h-3" />
                      {restaurant.rating}
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{restaurant.cuisineTypes}</p>
                <div className="flex items-center justify-between text-xs">
                  {restaurant.offer && <span className="text-primary font-medium">{restaurant.offer}</span>}
                  {restaurant.eta && <span className="text-muted-foreground">{restaurant.eta}</span>}
                </div>
              </div>
            </Link>
          ))}
        {!isLoading && !isError && restaurantRows.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-12">No restaurants found.</p>
        )}
      </section>

      <BottomNav />
    </div>
  );
};

export default RestaurantList;
