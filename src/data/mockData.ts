export type StoreType = "food" | "bazaar" | "electronic";

export interface Product {
  id: string;
  name: string;
  weight: string;
  price: number;
  originalPrice: number;
  image: string;
  category: string;
  store: StoreType;
  rating: number;
  badge?: string;
  description?: string;
  restaurantId?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  eta: string;
  rating: number;
  image: string;
  offer?: string;
  /** Present when loaded from API (filtering / display). */
  store?: StoreType;
}

export interface Category {
  id: string;
  label: string;
  icon: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  code?: string;
  store: StoreType;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  status: "delivered" | "processing" | "cancelled" | "on_the_way";
  store: StoreType;
}

export const storeTypes = [
  { id: "food" as StoreType, label: "Food", icon: "utensils" },
  { id: "bazaar" as StoreType, label: "Bazaar", icon: "store" },
  { id: "electronic" as StoreType, label: "Electronic", icon: "laptop" },
];

export const categories: Record<StoreType, Category[]> = {
  food: [
    { id: "all", label: "All", icon: "th-large" },
    { id: "biryani", label: "Biryani", icon: "bowl-rice" },
    { id: "pizza", label: "Pizza", icon: "pizza-slice" },
    { id: "burger", label: "Burger", icon: "burger" },
    { id: "chinese", label: "Chinese", icon: "bowl-food" },
    { id: "dessert", label: "Desserts", icon: "cake-candles" },
    { id: "thali", label: "Thali", icon: "plate-wheat" },
  ],
  bazaar: [
    { id: "all", label: "All", icon: "th-large" },
    { id: "fresh", label: "Vegetables", icon: "carrot" },
    { id: "fruits", label: "Fruits", icon: "apple-whole" },
    { id: "dairy", label: "Dairy", icon: "cheese" },
    { id: "grocery", label: "Grocery", icon: "basket-shopping" },
    { id: "spices", label: "Spices", icon: "pepper-hot" },
    { id: "cleaning", label: "Cleaning", icon: "broom" },
  ],
  electronic: [
    { id: "all", label: "All", icon: "th-large" },
    { id: "mobiles", label: "Mobiles", icon: "mobile-screen" },
    { id: "laptops", label: "Laptops", icon: "laptop" },
    { id: "audio", label: "Audio", icon: "headphones" },
    { id: "tv", label: "TV", icon: "tv" },
    { id: "accessories", label: "Accessories", icon: "keyboard" },
  ],
};

export const banners: Banner[] = [
  { id: "1", title: "50% OFF on First Order!", subtitle: "Use code: SWIFT50", code: "SWIFT50", store: "food" },
  { id: "2", title: "Free Delivery All Day!", subtitle: "No minimum order needed", store: "food" },
  { id: "3", title: "Fresh Sabzi at ₹1", subtitle: "First item at just ₹1", code: "BAZAAR1", store: "bazaar" },
  { id: "4", title: "Mega Electronic Sale!", subtitle: "Up to 70% off on gadgets", store: "electronic" },
  { id: "5", title: "Buy 2 Get 1 Free", subtitle: "On all accessories", store: "electronic" },
];

const foodProducts: Product[] = [
  { id: "f1", name: "Chicken Biryani Family Pack", weight: "1.2 kg", price: 449, originalPrice: 599, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&h=300&fit=crop", category: "biryani", store: "food", rating: 4.5, badge: "BEST SELLER", description: "Aromatic basmati rice cooked with tender chicken pieces, infused with traditional spices. Serves 4.", restaurantId: "r1" },
  { id: "f2", name: "Margherita Pizza Large", weight: "450 g", price: 299, originalPrice: 499, image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300&h=300&fit=crop", category: "pizza", store: "food", rating: 4.3, description: "Classic Italian pizza with fresh mozzarella, tomato sauce and basil on a crispy thin crust.", restaurantId: "r2" },
  { id: "f3", name: "Classic Smash Burger", weight: "350 g", price: 219, originalPrice: 349, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=300&fit=crop", category: "burger", store: "food", rating: 4.1, description: "Juicy double-smashed beef patty with cheese, pickles, onions and special sauce.", restaurantId: "r3" },
  { id: "f4", name: "Hakka Noodles", weight: "400 g", price: 179, originalPrice: 249, image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=300&h=300&fit=crop", category: "chinese", store: "food", rating: 4.0, description: "Stir-fried noodles with fresh vegetables and Indo-Chinese spices.", restaurantId: "r4" },
  { id: "f5", name: "Gulab Jamun Pack", weight: "12 pcs", price: 149, originalPrice: 199, image: "https://images.unsplash.com/photo-1666190059469-570b92f4dbbb?w=300&h=300&fit=crop", category: "dessert", store: "food", rating: 4.6, description: "Soft, melt-in-mouth gulab jamuns soaked in aromatic sugar syrup.", restaurantId: "r1" },
  { id: "f6", name: "Paneer Tikka Wrap", weight: "280 g", price: 169, originalPrice: 229, image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=300&h=300&fit=crop", category: "burger", store: "food", rating: 4.2, description: "Grilled paneer tikka wrapped in a soft tortilla with mint chutney and veggies.", restaurantId: "r3" },
  { id: "f7", name: "Veg Thali Special", weight: "Full Plate", price: 199, originalPrice: 299, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=300&fit=crop", category: "thali", store: "food", rating: 4.4, badge: "NEW", description: "Complete meal with dal, sabzi, roti, rice, raita and pickle.", restaurantId: "r4" },
  { id: "f8", name: "Chocolate Brownie", weight: "200 g", price: 129, originalPrice: 179, image: "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=300&h=300&fit=crop", category: "dessert", store: "food", rating: 4.7, description: "Rich, fudgy chocolate brownie with a gooey center.", restaurantId: "r2" },
];

const bazaarProducts: Product[] = [
  { id: "b1", name: "Fresh Tomatoes", weight: "1 kg", price: 40, originalPrice: 60, image: "https://images.unsplash.com/photo-1546470427-0d4db154ceb8?w=300&h=300&fit=crop", category: "fresh", store: "bazaar", rating: 4.4, badge: "FRESH", description: "Farm fresh red tomatoes, perfect for curries and salads." },
  { id: "b2", name: "Farm Fresh Milk", weight: "1 litre", price: 68, originalPrice: 80, image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&h=300&fit=crop", category: "dairy", store: "bazaar", rating: 4.7, description: "Pure full cream milk from local dairy farms." },
  { id: "b3", name: "Organic Bananas", weight: "1 dozen", price: 50, originalPrice: 70, image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=300&fit=crop", category: "fruits", store: "bazaar", rating: 4.2, description: "Naturally ripened organic bananas." },
  { id: "b4", name: "Basmati Rice Premium", weight: "5 kg", price: 450, originalPrice: 599, image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=300&fit=crop", category: "grocery", store: "bazaar", rating: 4.6, description: "Long grain premium basmati rice, aged for extra flavour." },
  { id: "b5", name: "Red Chilli Powder", weight: "200 g", price: 85, originalPrice: 110, image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&h=300&fit=crop", category: "spices", store: "bazaar", rating: 4.3, description: "Pure Kashmiri red chilli powder for rich color and mild heat." },
  { id: "b6", name: "Surf Excel Detergent", weight: "1 kg", price: 199, originalPrice: 250, image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=300&h=300&fit=crop", category: "cleaning", store: "bazaar", rating: 4.1, badge: "POPULAR", description: "Powerful stain removal detergent powder for all fabrics." },
  { id: "b7", name: "Fresh Paneer", weight: "500 g", price: 160, originalPrice: 200, image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300&h=300&fit=crop", category: "dairy", store: "bazaar", rating: 4.5, description: "Soft and fresh cottage cheese, made daily." },
  { id: "b8", name: "Green Apples", weight: "1 kg", price: 180, originalPrice: 220, image: "https://images.unsplash.com/photo-1568702846914-96b305d2uj68?w=300&h=300&fit=crop", category: "fruits", store: "bazaar", rating: 4.3, description: "Crisp and tangy green apples imported from Shimla." },
];

const electronicProducts: Product[] = [
  { id: "e1", name: "iPhone 15 Pro Max", weight: "256 GB", price: 134900, originalPrice: 159900, image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300&h=300&fit=crop", category: "mobiles", store: "electronic", rating: 4.8, badge: "TOP PICK", description: "A17 Pro chip, 48MP camera system, titanium design, all-day battery life." },
  { id: "e2", name: "MacBook Air M2", weight: "13.6 inch", price: 99900, originalPrice: 119900, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop", category: "laptops", store: "electronic", rating: 4.7, description: "Supercharged by M2, with up to 18 hours of battery life." },
  { id: "e3", name: "Sony WH-1000XM5", weight: "250 g", price: 24990, originalPrice: 34990, image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=300&h=300&fit=crop", category: "audio", store: "electronic", rating: 4.6, badge: "BEST SELLER", description: "Industry-leading noise cancellation with exceptional sound quality." },
  { id: "e4", name: "Samsung 55\" 4K Smart TV", weight: "55 inch", price: 42990, originalPrice: 59990, image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=300&h=300&fit=crop", category: "tv", store: "electronic", rating: 4.5, description: "Crystal 4K UHD display with smart hub and voice assistant." },
  { id: "e5", name: "Logitech MX Keys", weight: "810 g", price: 8995, originalPrice: 12995, image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&h=300&fit=crop", category: "accessories", store: "electronic", rating: 4.4, description: "Advanced wireless illuminated keyboard with smart backlighting." },
  { id: "e6", name: "OnePlus 12", weight: "128 GB", price: 54999, originalPrice: 64999, image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop", category: "mobiles", store: "electronic", rating: 4.5, description: "Snapdragon 8 Gen 3, Hasselblad camera, 100W charging." },
];

export const products: Record<StoreType, Product[]> = {
  food: foodProducts,
  bazaar: bazaarProducts,
  electronic: electronicProducts,
};

export const restaurants: Restaurant[] = [
  { id: "r1", name: "Nawab Biryani House", cuisine: "Biryani, Mughlai, Sweets", eta: "25-30 mins", rating: 4.6, image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&h=500&fit=crop", offer: "40% OFF up to ₹120" },
  { id: "r2", name: "Stone Oven Pizza", cuisine: "Pizza, Italian, Desserts", eta: "30-35 mins", rating: 4.4, image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=900&h=500&fit=crop", offer: "Free garlic bread" },
  { id: "r3", name: "Burger Garage", cuisine: "Burgers, Wraps, Fast Food", eta: "20-25 mins", rating: 4.3, image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=900&h=500&fit=crop", offer: "Buy 1 Get 1 on combos" },
  { id: "r4", name: "Wok & Thali Kitchen", cuisine: "Chinese, Thali, North Indian", eta: "28-32 mins", rating: 4.5, image: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=900&h=500&fit=crop", offer: "Flat ₹75 OFF" },
];

export const getRestaurantById = (restaurantId?: string) => restaurants.find((restaurant) => restaurant.id === restaurantId);

export const notifications = [
  { id: "1", title: "Order Delivered!", message: "Your order #SW2024001 has been delivered.", time: "2 mins ago", read: false },
  { id: "2", title: "Flash Sale 🔥", message: "50% off on electronics for the next 2 hours!", time: "15 mins ago", read: false },
  { id: "3", title: "Order Confirmed", message: "Your order #SW2024000 is being prepared.", time: "1 hour ago", read: true },
  { id: "4", title: "New Arrival", message: "Check out the latest smartphones!", time: "3 hours ago", read: true },
];

export const pastOrders: Order[] = [
  { id: "SW2024001", date: "2026-03-23", items: [{ name: "Chicken Biryani", qty: 2, price: 449 }, { name: "Gulab Jamun", qty: 1, price: 149 }], total: 1047, status: "delivered", store: "food" },
  { id: "SW2024002", date: "2026-03-22", items: [{ name: "Fresh Tomatoes", qty: 3, price: 40 }, { name: "Basmati Rice", qty: 1, price: 450 }], total: 570, status: "delivered", store: "bazaar" },
  { id: "SW2024003", date: "2026-03-21", items: [{ name: "Sony WH-1000XM5", qty: 1, price: 24990 }], total: 24990, status: "processing", store: "electronic" },
  { id: "SW2024004", date: "2026-03-20", items: [{ name: "Margherita Pizza", qty: 1, price: 299 }, { name: "Hakka Noodles", qty: 1, price: 179 }], total: 478, status: "on_the_way", store: "food" },
];

export const savedAddresses = [
  { id: "1", type: "Home", address: "B-42, Sector 15, Noida, UP - 201301", isDefault: true },
  { id: "2", type: "Work", address: "Tower A, Cyber City, Gurugram - 122002", isDefault: false },
  { id: "3", type: "Other", address: "23, MG Road, Connaught Place, Delhi - 110001", isDefault: false },
];
