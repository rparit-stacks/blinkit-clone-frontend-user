import { Link } from "react-router-dom";
import { FaStar, FaClock, FaTag } from "react-icons/fa";
import type { ApiStore } from "@/lib/catalogApi";

interface PartnerStoreCardProps {
  store: ApiStore;
  variant?: "horizontal" | "vertical";
}

const PartnerStoreCard = ({ store, variant = "vertical" }: PartnerStoreCardProps) => {
  const href = `/store-catalog/${store.id}`;

  if (variant === "horizontal") {
    return (
      <Link
        to={href}
        className="flex gap-3 bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.08)] p-3 active:scale-[0.99] transition-transform hover:-translate-y-0.5"
      >
        <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
          {store.coverImage || store.image ? (
            <img
              src={store.coverImage ?? store.image}
              alt={store.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-violet-100 to-purple-200 flex items-center justify-center">
              <span className="text-2xl font-extrabold text-primary/50">{store.name.charAt(0)}</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[13px] font-bold text-foreground truncate">{store.name}</h3>
          {store.cuisineTypes && (
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{store.cuisineTypes}</p>
          )}
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            {store.rating != null && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                <FaStar className="w-2.5 h-2.5 text-yellow-500" /> {store.rating.toFixed(1)}
              </span>
            )}
            {store.eta && (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
                <FaClock className="w-2.5 h-2.5" /> {store.eta}
              </span>
            )}
          </div>
          {store.offer && (
            <p className="text-[10px] font-bold text-primary mt-1 truncate">
              <FaTag className="inline w-2.5 h-2.5 mr-0.5" />{store.offer}
            </p>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={href}
      className="min-w-[170px] max-w-[170px] bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.08)] overflow-hidden active:scale-[0.97] transition-transform hover:-translate-y-1 flex-shrink-0"
    >
      <div className="relative h-24 bg-gray-100 overflow-hidden">
        {store.coverImage || store.image ? (
          <img
            src={store.coverImage ?? store.image}
            alt={store.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-violet-100 to-purple-200 flex items-center justify-center">
            <span className="text-3xl font-extrabold text-primary/40">{store.name.charAt(0)}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        {store.rating != null && (
          <div className="absolute top-2 right-2 inline-flex items-center gap-0.5 text-[10px] font-bold text-white bg-black/40 backdrop-blur-sm px-1.5 py-0.5 rounded-full">
            <FaStar className="w-2.5 h-2.5 text-yellow-400" /> {store.rating.toFixed(1)}
          </div>
        )}
      </div>
      <div className="p-2.5">
        <h3 className="text-[12px] font-bold text-foreground truncate">{store.name}</h3>
        {store.cuisineTypes && (
          <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{store.cuisineTypes}</p>
        )}
        <div className="mt-1.5 flex items-center justify-between">
          {store.eta && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
              <FaClock className="w-2.5 h-2.5" /> {store.eta}
            </span>
          )}
          {store.offer && (
            <span className="text-[10px] font-bold text-primary truncate max-w-[80px]">{store.offer}</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default PartnerStoreCard;
