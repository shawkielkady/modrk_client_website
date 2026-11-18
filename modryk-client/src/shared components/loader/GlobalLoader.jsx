import logo from "../../../assets/modryklogo.png";

export default function GlobalLoader({ text = "جاري التحميل..." }) {
  return (
    <div
      role="status"
      aria-live="assertive"
      className="fixed inset-0 z-[9998] bg-black/45 backdrop-blur-[2px] flex items-center justify-center p-4 transition-all duration-300 animate-fade-in"
    >
      <div className="bg-white/95 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center shadow-2xl border border-gray-100 max-w-[280px] w-full text-center">
        {/* Animated Brand Ring & Spinner */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          {/* Outer rotating gradient ring */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-secondary animate-spin" />

          {/* Inner pulsating glow ring */}
          <div className="w-14 h-14 rounded-full bg-[#F7F4ED] flex items-center justify-center p-2 shadow-inner">
            <img
              src={logo}
              alt="Modrek"
              className="w-10 h-10 object-contain animate-pulse"
            />
          </div>
        </div>

        {/* Loading text */}
        <p className="mt-5 text-primary font-bold text-base md:text-lg tracking-wide">
          {text}
        </p>

        {/* Subtle bouncing dots */}
        <div className="flex gap-1.5 mt-2">
          <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 rounded-full bg-primary/70 animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 rounded-full bg-primary animate-bounce" />
        </div>
      </div>
    </div>
  );
}

