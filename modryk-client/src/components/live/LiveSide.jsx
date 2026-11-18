import { EllipsisVertical } from "lucide-react";
import { useModal } from "../../shared components/model/ModelContext";
import DetailsModel from "./models/DetailsModel";
import { useSelector } from "react-redux";
import {
  selectSelectedFarm,
  selectFarmsDetailsLoading,
} from "../../data/farms/farmsSlice";
import { DynamicLivePlayer } from "./DynamicLivePlayer";

const buildStreamId = (farmId, rtspUrl) => {
  if (!rtspUrl) return `farm_${farmId || "default"}`;
  let hash = 0;
  for (let i = 0; i < rtspUrl.length; i++) {
    hash = (hash * 31 + rtspUrl.charCodeAt(i)) >>> 0;
  }
  return `farm_${farmId || "live"}_${hash.toString(36)}`;
};

function LiveSide() {
  const { openModal } = useModal();
  const selectedFarm = useSelector(selectSelectedFarm);
  const loading = useSelector(selectFarmsDetailsLoading);

  const firstLiveEntry = selectedFarm?.live_urls?.[0];
  const liveUrl =
    typeof firstLiveEntry === "string" ? firstLiveEntry : firstLiveEntry?.url;
  const isVideoFile = liveUrl && /\.(mp4|webm|ogg)(\?.*)?$/i.test(liveUrl);
  const streamId = buildStreamId(selectedFarm?.id, liveUrl);

  return (
    <div className="col-span-2 lg:col-span-8 lg:col-start-3 lg:row-start-1 lg:row-span-2 relative">
      {loading ? (
        <div className="relative z-1 w-full h-[320px] sm:h-[450px] lg:h-[550px] rounded-xl bg-gray-900 flex flex-col items-center justify-center gap-3 text-white border border-white/10">
          <div className="w-10 h-10 rounded-full border-4 border-transparent border-t-primary border-r-secondary animate-spin" />
          <span className="text-sm font-bold text-gray-300">
            جاري تحميل البث المباشر...
          </span>
        </div>
      ) : liveUrl && !isVideoFile ? (
        <DynamicLivePlayer
          key={streamId}
          rtspUrl={liveUrl}
          streamId={streamId}
        />
      ) : isVideoFile || selectedFarm?.video ? (
        <video
          src={isVideoFile ? liveUrl : selectedFarm.video}
          controls
          autoPlay
          muted
          playsInline
          className="relative z-1 w-full h-auto max-h-[75vh] object-contain rounded-xl bg-black shadow-lg"
          poster={selectedFarm.image}
        >
          متصفحك لا يدعم تشغيل الفيديو
        </video>
      ) : selectedFarm?.image ? (
        <img
          src={selectedFarm.image}
          alt={selectedFarm.name || "Live"}
          className="relative z-1 w-full h-auto max-h-[75vh] object-cover rounded-xl"
        />
      ) : (
        <div className="relative z-1 w-full h-[320px] sm:h-[450px] rounded-xl bg-gray-900 flex items-center justify-center text-gray-400">
          لا يوجد بث مباشر متاح حالياً
        </div>
      )}

      <div className="absolute inset-x-0 top-2 sm:top-3 z-2 flex justify-between items-start px-3 sm:px-4 pointer-events-none">
        <button
          type="button"
          onClick={() =>
            openModal(DetailsModel, {
              modalClassName: "bg-primary text-white",
              farm: selectedFarm,
            })
          }
          id="showMenu"
          aria-label="تفاصيل"
          className="size-8 sm:size-9 flex items-center justify-center rounded-full bg-secondary text-white transition-all cursor-pointer hover:opacity-90 pointer-events-auto"
        >
          <EllipsisVertical className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <div className="flex flex-col gap-2 items-center pointer-events-auto">
          <span
            className="live-blink inline-flex items-center gap-1.5 rounded-full bg-secondary text-white
                                 text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1"
          >
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            مباشر
          </span>
        </div>
      </div>
    </div>
  );
}

export default LiveSide;
