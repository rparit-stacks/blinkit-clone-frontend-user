import { FaMapMarkerAlt, FaSadTear, FaBell } from "react-icons/fa";

interface Props {
  message?: string;
  onDismiss?: () => void;
}

export default function OutOfZoneBanner({ message, onDismiss }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden">
        {/* Illustration area */}
        <div className="bg-gradient-to-br from-violet-50 to-pink-50 px-6 pt-8 pb-6 flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className="w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center">
              <FaMapMarkerAlt className="w-9 h-9 text-red-400" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center shadow">
              <FaSadTear className="w-3.5 h-3.5 text-orange-500" />
            </div>
          </div>
          <h2 className="text-lg font-bold text-slate-900">We're not here yet!</h2>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            {message ?? "Sorry, we don't deliver to your location yet. We're expanding soon!"}
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-3">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5">
            <FaBell className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-800 leading-relaxed">
              <span className="font-semibold">Coming soon to your area!</span> We're constantly expanding. Check back later or explore what's available.
            </p>
          </div>

          {onDismiss && (
            <button
              onClick={onDismiss}
              className="w-full py-3 rounded-2xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              Browse Anyway
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
