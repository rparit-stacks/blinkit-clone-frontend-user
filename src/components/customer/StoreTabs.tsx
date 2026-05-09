import { StoreType, storeTypes } from "@/data/mockData";
import storeFood from "@/assets/store-food.png";
import storeBazaar from "@/assets/store-bazaar.png";
import storeElectronic from "@/assets/store-electronic.png";

interface StoreTabsProps {
  active: StoreType;
  onChange: (store: StoreType) => void;
}

const storeImages: Record<StoreType, string> = {
  food: storeFood,
  bazaar: storeBazaar,
  electronic: storeElectronic,
};

const storeLabels: Record<StoreType, { top: string; bottom: string }> = {
  food: { top: "Food", bottom: "Delivery" },
  bazaar: { top: "Bazaar", bottom: "Market" },
  electronic: { top: "Electronics", bottom: "Store" },
};

const StoreTabs = ({ active, onChange }: StoreTabsProps) => {
  return (
    <div className="lg:hidden relative px-4 pt-2 pb-2 overflow-x-hidden overflow-y-visible bg-[#F7F3FF]">
      <img
        src="/Untitled.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute z-0 bottom-0 left-1/2 w-screen -translate-x-1/2 h-14 object-cover object-bottom opacity-50"
        loading="lazy"
        decoding="async"
      />
      <div className="relative z-10 grid grid-cols-3 gap-2">
        {storeTypes.map((store) => {
          const isActive = active === store.id;
          return (
            <button
              key={store.id}
              onClick={() => onChange(store.id)}
              className={`min-w-0 flex items-center gap-1.5 px-2 py-2.5 rounded-2xl transition-all duration-200 active:scale-[0.97] ${
                isActive
                  ? "bg-white ring-[1.5px] ring-primary/40 shadow-[0_6px_22px_rgba(75,0,130,0.16)]"
                  : "bg-violet-50/60 hover:bg-violet-50"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 ${
                  isActive ? "bg-violet-100" : "bg-white/80"
                }`}
              >
                <img
                  src={storeImages[store.id]}
                  alt={store.label}
                  className="w-8 h-8 object-contain"
                  width={32}
                  height={32}
                />
              </div>
              <div className="text-left min-w-0">
                <p className={`text-[11px] font-bold leading-tight truncate ${isActive ? "text-primary" : "text-foreground"}`}>
                  {storeLabels[store.id].top}
                </p>
                <p className="text-[10px] text-muted-foreground leading-tight truncate">{storeLabels[store.id].bottom}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StoreTabs;
