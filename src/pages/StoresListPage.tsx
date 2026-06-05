import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaStore } from "react-icons/fa";
import { catalogKeys, fetchStores } from "@/lib/catalogApi";
import BottomNav from "@/components/customer/BottomNav";
import PartnerStoreCard from "@/components/customer/PartnerStoreCard";

const SECTIONS = [
  { id: "food" as const, label: "Food Stores", emoji: "🍽️" },
  { id: "bazaar" as const, label: "Bazaar Stores", emoji: "🛒" },
  { id: "electronic" as const, label: "Electronics Stores", emoji: "⚡" },
];

const StoresSection = ({ storeType, label, emoji }: { storeType: "food" | "bazaar" | "electronic"; label: string; emoji: string }) => {
  const { data: stores = [], isLoading } = useQuery({
    queryKey: catalogKeys.stores(storeType),
    queryFn: () => fetchStores(storeType),
    staleTime: 5 * 60 * 1000,
  });

  if (!isLoading && stores.length === 0) return null;

  return (
    <section className="px-4 py-3 max-w-7xl mx-auto">
      <h2 className="text-[15px] font-bold text-foreground mb-3 flex items-center gap-1.5">
        <span>{emoji}</span> {label}
      </h2>
      {isLoading ? (
        <div className="space-y-2.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2.5">
          {stores.map((store) => (
            <PartnerStoreCard key={store.id} store={store} variant="horizontal" />
          ))}
        </div>
      )}
    </section>
  );
};

const StoresListPage = () => {
  return (
    <div className="mobile-page bg-background">
      {/* Nainital night hero */}
      <div className="relative h-48 overflow-hidden">
        <img
          src="/naini-hero.jpg"
          alt="Nainital city at night"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-4">
          <Link
            to="/"
            className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
          >
            <FaArrowLeft className="w-4 h-4 text-white" />
          </Link>
          <img src="/naini-store-logo.png" alt="NainiStore" className="h-10 object-contain drop-shadow-lg" />
          <div className="w-9" />
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2 mb-1">
            <FaStore className="w-4 h-4 text-amber-400" />
            <h1 className="text-xl font-extrabold text-white">Partner Stores</h1>
          </div>
          <p className="text-[12px] text-white/70">Discover all local stores on NainiStore</p>
        </div>
      </div>

      <div className="pb-24">
        {SECTIONS.map((s) => (
          <StoresSection key={s.id} storeType={s.id} label={s.label} emoji={s.emoji} />
        ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default StoresListPage;
