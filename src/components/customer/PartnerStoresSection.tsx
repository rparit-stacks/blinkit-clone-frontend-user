import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FaArrowRight, FaStore } from "react-icons/fa";
import { catalogKeys, fetchStores } from "@/lib/catalogApi";
import type { StoreType } from "@/data/mockData";
import PartnerStoreCard from "./PartnerStoreCard";

interface PartnerStoresSectionProps {
  store: StoreType;
  title?: string;
}

const PartnerStoresSection = ({ store, title }: PartnerStoresSectionProps) => {
  const { data: stores = [], isLoading } = useQuery({
    queryKey: catalogKeys.stores(store),
    queryFn: () => fetchStores(store),
    staleTime: 5 * 60 * 1000,
  });

  const sectionTitle = title ?? `${store === "food" ? "Food" : store === "bazaar" ? "Bazaar" : "Electronics"} Stores`;

  if (isLoading) {
    return (
      <section className="px-4 py-3 lg:px-10 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="h-4 w-32 bg-gray-200 rounded-md animate-pulse" />
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="min-w-[170px] h-[160px] bg-gray-100 rounded-2xl animate-pulse flex-shrink-0" />
          ))}
        </div>
      </section>
    );
  }

  if (stores.length === 0) return null;

  return (
    <section className="px-4 py-3 lg:px-10 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[14px] font-bold text-foreground flex items-center gap-1.5">
          <FaStore className="w-3.5 h-3.5 text-primary" /> {sectionTitle}
        </h3>
        <Link to="/stores" className="flex items-center gap-1 text-[11px] font-semibold text-primary">
          View all <FaArrowRight className="w-2.5 h-2.5" />
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
        {stores.map((s) => (
          <PartnerStoreCard key={s.id} store={s} variant="vertical" />
        ))}
      </div>
    </section>
  );
};

export default PartnerStoresSection;
