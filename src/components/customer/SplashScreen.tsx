import { useState, useEffect } from "react";
import splashLogo from "@/assets/splash-logo.png";

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setFadeOut(true), 2000);
    const timer2 = setTimeout(() => onFinish(), 2500);
    return () => { clearTimeout(timer1); clearTimeout(timer2); };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
      style={{
        backgroundImage: 'url("/naini-hero.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center 40%",
      }}
    >
      {/* Atmospheric overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#07090f]/90 via-[#07090f]/55 to-[#07090f]/30" />

      <div className="relative flex flex-col items-center">
        <div
          className="w-20 h-20 rounded-[24px] flex items-center justify-center mb-5"
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.15)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            boxShadow: "0 16px 40px -8px rgba(0,0,0,0.5)",
          }}
        >
          <img src={splashLogo} alt="NainiStore" className="w-12 h-12 drop-shadow-lg" width={48} height={48} />
        </div>
        <h1 className="text-[2rem] font-black text-white tracking-tight">NainiStore</h1>
        <p className="text-sm mt-1 font-medium" style={{ color: "#e8ab3f" }}>
          Nainital · Delivered fast
        </p>
      </div>

      {/* Loading dots */}
      <div className="absolute bottom-[max(5rem,env(safe-area-inset-bottom))] flex gap-2">
        <span
          className="w-1.5 h-1.5 rounded-full animate-bounce"
          style={{ background: "rgba(232,171,63,0.7)", animationDelay: "0ms" }}
        />
        <span
          className="w-1.5 h-1.5 rounded-full animate-bounce"
          style={{ background: "rgba(232,171,63,0.7)", animationDelay: "150ms" }}
        />
        <span
          className="w-1.5 h-1.5 rounded-full animate-bounce"
          style={{ background: "rgba(232,171,63,0.7)", animationDelay: "300ms" }}
        />
      </div>
    </div>
  );
};

export default SplashScreen;
