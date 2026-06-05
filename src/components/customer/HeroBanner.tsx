import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { StoreType } from "@/data/mockData";
import { catalogKeys, fetchStoreBanners } from "@/lib/catalogApi";

const gradients: Record<StoreType, string> = {
  food: "from-[#4B0082] to-[#7C3AED]",
  bazaar: "from-[#5B21B6] to-[#A855F7]",
  electronic: "from-[#312E81] to-[#7E22CE]",
};

interface HeroBannerProps {
  store: StoreType;
}

const HeroBanner = ({ store }: HeroBannerProps) => {
  const { data: storeBanners = [] } = useQuery({
    queryKey: catalogKeys.banners(store),
    queryFn: () => fetchStoreBanners(store),
    staleTime: 5 * 60 * 1000,
  });

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    setCurrent(0);
  }, [store]);

  useEffect(() => {
    if (storeBanners.length <= 1) return;
    const timer = setInterval(() => setCurrent((c) => (c + 1) % storeBanners.length), 3000);
    return () => clearInterval(timer);
  }, [storeBanners.length]);

  const banner = storeBanners[current] ?? null;

  return (
    <div className="px-4 py-2 lg:px-10 max-w-7xl mx-auto space-y-2">
      {/* Nainital night hero */}
      <div className="relative h-32 rounded-2xl overflow-hidden">
        <img
          src="/naini-hero.jpg"
          alt="Nainital"
          className="w-full h-full object-cover object-[50%_60%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        <div className="absolute bottom-3 left-4">
          <p className="text-white font-extrabold text-lg leading-tight">NainiStore</p>
          <p className="text-white/70 text-[11px]">Local Hai, Instant Hai</p>
        </div>
        <img
          src="/naini-store-logo.png"
          alt="NainiStore logo"
          className="absolute bottom-3 right-3 h-8 object-contain opacity-80"
        />
      </div>

      {banner !== null && (
      <div
        className={`relative bg-gradient-to-r ${gradients[store]} rounded-2xl h-36 lg:h-52 flex items-center px-5 lg:px-10 overflow-hidden`}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.18]"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            WebkitMaskImage: 'url("/sd.png")',
            WebkitMaskRepeat: "repeat",
            WebkitMaskSize: "240px 240px",
            WebkitMaskPosition: "center",
            maskImage: 'url("/sd.png")',
            maskRepeat: "repeat",
            maskSize: "240px 240px",
            maskPosition: "center",
          }}
        />
        <div className="relative z-10">
          <h2 className="text-xl lg:text-2xl font-bold text-white">{banner.title}</h2>
          <p className="text-sm text-white/80 mt-1">{banner.subtitle}</p>
          {banner.code && (
            <span className="inline-block mt-2 px-3 py-1 bg-black/25 backdrop-blur-sm text-white text-xs font-bold rounded-full border border-white/20">
              {banner.code}
            </span>
          )}
        </div>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {storeBanners.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              aria-label={`Go to banner ${i + 1}`}
              className={`rounded-full transition-all ${i === current ? "w-5 h-2 bg-white/90" : "w-2 h-2 bg-white/40"}`}
            />
          ))}
        </div>
      </div>
      )}
    </div>
  );
};

export default HeroBanner;
