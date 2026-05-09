import type { ApiCategory } from "@/lib/catalogApi";
import type { IconType } from "react-icons";
import {
  FaThLarge,
  FaDrumstickBite,
  FaPizzaSlice,
  FaHamburger,
  FaUtensils,
  FaBirthdayCake,
  FaCarrot,
  FaAppleAlt,
  FaCheese,
  FaPepperHot,
  FaBroom,
  FaMobileAlt,
  FaLaptop,
  FaHeadphones,
  FaTv,
  FaKeyboard,
} from "react-icons/fa";

interface CategoryPillsProps {
  categories: ApiCategory[];
  active: string;
  onChange: (id: string) => void;
}

const iconByCategoryId: Record<string, IconType> = {
  all: FaThLarge,
  biryani: FaDrumstickBite,
  pizza: FaPizzaSlice,
  burger: FaHamburger,
  chinese: FaUtensils,
  dessert: FaBirthdayCake,
  thali: FaUtensils,
  fresh: FaCarrot,
  fruits: FaAppleAlt,
  dairy: FaCheese,
  grocery: FaThLarge,
  spices: FaPepperHot,
  cleaning: FaBroom,
  mobiles: FaMobileAlt,
  laptops: FaLaptop,
  audio: FaHeadphones,
  tv: FaTv,
  accessories: FaKeyboard,
};

const CategoryPills = ({ categories, active, onChange }: CategoryPillsProps) => {
  const allCats: ApiCategory[] = [{ id: "all", label: "All", icon: "th-large" }, ...categories];
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 pt-1 pb-3 lg:px-10">
      {allCats.map((cat) => {
        const isActive = active === cat.id;
        const Icon = iconByCategoryId[cat.id] ?? FaThLarge;
        return (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
              isActive
                ? "bg-primary text-white border-primary shadow-[0_4px_14px_rgba(75,0,130,0.28)]"
                : "bg-white text-foreground border-gray-200 hover:bg-gray-50"
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-muted-foreground"}`} />
            <span>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryPills;
