export default function ProductCardSkeleton() {
  return (
    <div className="relative item-card w-full h-[300px] rounded-xl bg-gray-200 overflow-hidden shadow-md pointer-events-none">
      {/* Background card shimmer */}
      <div className="w-full h-full shimmer"></div>

      {/* Top bar fake buttons */}
      <div className="absolute w-full flex justify-between top-2 px-4 z-10">
        <div className="w-8 h-8 rounded-full bg-white/70 backdrop-blur-xs shimmer"></div>
        <div className="w-16 h-6 rounded-full bg-white/70 backdrop-blur-xs shimmer"></div>
      </div>

      {/* Bottom details card fake */}
      <div className="absolute bottom-0 w-full z-10">
        <div className="bg-[#154554]/75 backdrop-blur-xs px-2.5 w-full h-[70px] pt-2 flex flex-col justify-between pb-2">
          <div className="flex justify-between items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-white/40 shimmer shrink-0"></div>
            <div className="h-3.5 bg-white/40 rounded-md shimmer flex-1"></div>
            <div className="h-3.5 bg-white/40 rounded-md shimmer w-16"></div>
            <div className="w-10 h-8 rounded bg-white/30 shimmer shrink-0"></div>
          </div>
          <div className="flex justify-between items-center gap-2">
            <div className="h-2.5 bg-white/40 rounded shimmer w-20"></div>
            <div className="h-2.5 bg-white/40 rounded shimmer w-16"></div>
            <div className="h-2.5 bg-white/40 rounded shimmer w-24"></div>
          </div>
        </div>

        <div className="bg-primary p-2 h-10 flex justify-between items-center">
          <div className="h-3.5 bg-white/30 rounded shimmer w-28"></div>
          <div className="h-3.5 bg-white/30 rounded shimmer w-16"></div>
          <div className="h-3.5 bg-white/30 rounded shimmer w-20"></div>
        </div>
      </div>
    </div>
  );
}

