import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { FaChevronLeft, FaSlidersH, FaTimes, FaStar, FaSearch, FaMicrophone } from "react-icons/fa";
import { Link, useParams, useSearchParams, useNavigate } from "react-router-dom";
import { type StoreType, storeTypes } from "@/data/mockData";
import { catalogKeys, searchProducts, type ApiProduct } from "@/lib/catalogApi";
import ProductCard from "@/components/customer/ProductCard";
import BottomNav from "@/components/customer/BottomNav";
import FloatingCartBar from "@/components/customer/FloatingCartBar";

const isStoreType = (value: string | undefined): value is StoreType =>
  !!value && storeTypes.some((store) => store.id === value);
const normalizeStoreId = (value: string | undefined) => (value === "bazar" ? "bazaar" : value);

const ALL_STORES: StoreType[] = ["food", "bazaar", "electronic"];

const recentSearches: Record<StoreType, string[]> = {
  food: ["Biryani", "Pizza", "Burger", "Thali"],
  bazaar: ["Tomatoes", "Milk", "Rice", "Apples"],
  electronic: ["iPhone", "Laptop", "Headphones", "Smart TV"],
};

const categoryLabel: Record<StoreType, string> = {
  food: "Food",
  bazaar: "Bazaar",
  electronic: "Electronics",
};

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const SearchPage = () => {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const normalizedStoreId = normalizeStoreId(storeId);
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<"all" | "under100" | "100to500" | "above500">("all");
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const recognitionRef = useRef<unknown>(null);
  const finalTranscriptRef = useRef("");
  const inputRef = useRef<HTMLInputElement>(null);

  const storeValid = isStoreType(normalizedStoreId);
  const activeStore: StoreType = storeValid ? normalizedStoreId : "food";

  const debouncedQuery = useDebounce(query.trim(), 300);

  // Search the active store
  const { data: activeResults = [], isFetching: activeFetching } = useQuery({
    queryKey: catalogKeys.search(activeStore, debouncedQuery),
    queryFn: () => searchProducts(activeStore, debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 60 * 1000,
  });

  // Cross-store searches (only when query is typed)
  const otherStores = ALL_STORES.filter((s) => s !== activeStore);
  const { data: crossResults0 = [] } = useQuery({
    queryKey: catalogKeys.search(otherStores[0], debouncedQuery),
    queryFn: () => searchProducts(otherStores[0], debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 60 * 1000,
  });
  const { data: crossResults1 = [] } = useQuery({
    queryKey: catalogKeys.search(otherStores[1], debouncedQuery),
    queryFn: () => searchProducts(otherStores[1], debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 60 * 1000,
  });

  // Combine all results grouped by store
  const crossByStore: Array<{ store: StoreType; items: ApiProduct[] }> = [
    { store: otherStores[0], items: crossResults0 },
    { store: otherStores[1], items: crossResults1 },
  ].filter((g) => g.items.length > 0);

  // Apply filters to active store results
  const filtered = activeResults.filter((p) => {
    if (ratingFilter > 0 && p.rating < ratingFilter) return false;
    if (priceRange === "under100" && p.price >= 100) return false;
    if (priceRange === "100to500" && (p.price < 100 || p.price > 500)) return false;
    if (priceRange === "above500" && p.price <= 500) return false;
    return true;
  });

  const isSearching = activeFetching && debouncedQuery.length >= 2;
  const hasQuery = debouncedQuery.length >= 2;

  const handleVoiceSearch = () => {
    if (isListening) return;
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Voice search is not supported in this browser.");
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognitionRef.current = recognition;
    finalTranscriptRef.current = "";
    setIsListening(true);
    setLiveTranscript("");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let interim = "";
      let finalChunk = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const text = event.results[i][0]?.transcript ?? "";
        if (event.results[i].isFinal) finalChunk += text;
        else interim += text;
      }
      if (finalChunk.trim()) {
        finalTranscriptRef.current = `${finalTranscriptRef.current} ${finalChunk}`.trim();
      }
      const composed = `${finalTranscriptRef.current} ${interim}`.trim();
      setLiveTranscript(composed);
      setQuery(composed);
      if (finalChunk.trim()) {
        setIsListening(false);
      }
    };
    recognition.onerror = () => { setIsListening(false); setLiveTranscript(""); };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  // Auto-focus input on mount
  useEffect(() => { inputRef.current?.focus(); }, []);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header with inline search bar */}
      <header className="sticky top-0 z-50 bg-[#F7F3FF] border-b border-violet-100/60 px-4 py-3 flex items-center gap-3">
        <Link
          to={activeStore === "food" ? "/" : `/store/${activeStore}`}
          className="w-9 h-9 rounded-full bg-white/90 border border-violet-100 flex items-center justify-center text-foreground flex-shrink-0"
        >
          <FaChevronLeft className="w-3.5 h-3.5" />
        </Link>

        <form
          onSubmit={(e) => { e.preventDefault(); inputRef.current?.blur(); }}
          className="flex-1 flex items-center gap-2 bg-white rounded-2xl h-11 px-4 border-2 border-primary/25 focus-within:border-primary/55 focus-within:ring-2 focus-within:ring-primary/20 transition-colors"
        >
          <FaSearch className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search in ${categoryLabel[activeStore]}…`}
            className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground outline-none"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground">
              <FaTimes className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={handleVoiceSearch}
            className={`flex-shrink-0 p-1.5 rounded-full transition-colors ${isListening ? "bg-gradient-to-r from-[#4B0082] to-[#A855F7] text-white" : "text-muted-foreground hover:text-primary"}`}
          >
            <FaMicrophone className="w-4 h-4" />
          </button>
        </form>

        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`w-9 h-9 rounded-full flex-shrink-0 border flex items-center justify-center transition-colors ${showFilters ? "bg-primary border-primary text-primary-foreground" : "bg-white/90 border-violet-100 text-foreground"}`}
        >
          <FaSlidersH className="w-4 h-4" />
        </button>
      </header>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-card border-b border-border px-4 py-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Filters</h3>
            <button type="button" onClick={() => setShowFilters(false)}><FaTimes className="w-4 h-4 text-muted-foreground" /></button>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Price</p>
            <div className="flex gap-2 flex-wrap">
              {([["all", "All"], ["under100", "Under ₹100"], ["100to500", "₹100–500"], ["above500", "Above ₹500"]] as const).map(([val, label]) => (
                <button
                  key={val} type="button"
                  onClick={() => setPriceRange(val)}
                  className={`px-3 py-1.5 rounded-pill text-xs font-medium ${priceRange === val ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Min Rating</p>
            <div className="flex gap-2">
              {[0, 3, 4, 4.5].map((r) => (
                <button
                  key={r} type="button"
                  onClick={() => setRatingFilter(r)}
                  className={`px-3 py-1.5 rounded-pill text-xs font-medium flex items-center gap-1 ${ratingFilter === r ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  {r === 0 ? "All" : <><FaStar className="w-3 h-3" /> {r}+</>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="px-4 py-4 max-w-7xl mx-auto space-y-6">
        {/* No query → show recent searches + store tabs */}
        {!hasQuery && (
          <>
            {/* Store selector */}
            <div className="flex gap-2">
              {ALL_STORES.map((s) => (
                <button
                  key={s} type="button"
                  onClick={() => navigate(`/search/${s}${query ? `?q=${encodeURIComponent(query)}` : ""}`)}
                  className={`px-4 py-2 rounded-pill text-xs font-semibold transition-colors ${activeStore === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  {categoryLabel[s]}
                </button>
              ))}
            </div>

            <div>
              <h3 className="text-sm font-bold text-foreground mb-3">Recent Searches</h3>
              <div className="flex flex-wrap gap-2">
                {recentSearches[activeStore].map((s) => (
                  <button
                    key={s} type="button"
                    onClick={() => setQuery(s)}
                    className="px-3 py-1.5 bg-muted text-foreground rounded-pill text-xs font-medium"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Loading indicator */}
        {isSearching && (
          <p className="text-sm text-muted-foreground">Searching…</p>
        )}

        {/* Active store results */}
        {hasQuery && !isSearching && (
          <>
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-foreground">
                  {categoryLabel[activeStore]} — {filtered.length} result{filtered.length !== 1 ? "s" : ""} for &ldquo;{debouncedQuery}&rdquo;
                </p>
                <div className="flex gap-1">
                  {ALL_STORES.map((s) => (
                    <button
                      key={s} type="button"
                      onClick={() => navigate(`/search/${s}?q=${encodeURIComponent(query)}`)}
                      className={`px-3 py-1 rounded-pill text-[11px] font-semibold transition-colors ${activeStore === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                    >
                      {categoryLabel[s]}
                    </button>
                  ))}
                </div>
              </div>

              {filtered.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <span className="text-5xl mb-4">🔍</span>
                  <h3 className="text-base font-bold text-foreground">No results in {categoryLabel[activeStore]}</h3>
                  <p className="text-sm text-muted-foreground mt-1">Try a different keyword or check other categories below</p>
                </div>
              )}
            </div>

            {/* Cross-store results */}
            {crossByStore.map(({ store, items }) => (
              <div key={store}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-foreground">
                    Also in {categoryLabel[store]} ({items.length})
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate(`/search/${store}?q=${encodeURIComponent(query)}`)}
                    className="text-xs text-primary font-medium"
                  >
                    See all →
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {items.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Voice overlay */}
      {isListening && (
        <div className="fixed inset-0 z-[90] bg-black/30 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="w-full max-w-xs rounded-2xl bg-white p-4 border border-primary/20 shadow-[0_12px_34px_rgba(0,0,0,0.2)]">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3 animate-pulse">
                <FaMicrophone className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm font-bold text-foreground">Listening…</p>
              <p className="text-xs text-muted-foreground mt-1">Bolte rahiye, text box me auto-fill hoga</p>
              <div className="mt-3 min-h-9 w-full rounded-lg bg-muted/60 border border-border px-3 py-2 text-xs text-foreground">
                {liveTranscript || "Say something..."}
              </div>
              <button
                type="button"
                onClick={() => { (recognitionRef.current as { stop?: () => void })?.stop?.(); setIsListening(false); }}
                className="mt-3 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-semibold"
              >
                Stop
              </button>
            </div>
          </div>
        </div>
      )}

      <FloatingCartBar />
      <BottomNav />
    </div>
  );
};

export default SearchPage;
