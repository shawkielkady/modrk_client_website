import { useModal } from "../../../shared components/model/ModelContext";
import DownloadAppModel from "./DownloadAppModel";
// import PreOrderWarn from "./PreOrderWarn";
import QuantityModel from "./QuantityModel";
import sheepIcon from "@assets/sheepicon.png";
import shepherdIcon from "@assets/shephered.svg";

export default function ChooseSheepModel() {
  const { openModal } = useModal();

  return (
    <div className="w-full bg-primary text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pr-5 pl-14 pt-5 pb-3.5 border-b border-white/10">
        <div className="flex-1 text-right">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white m-0 leading-snug">
            حدد طريقة اختيار الأغنام
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col sm:flex-row bg-[#D9D9D9] text-primary">
        <div className="w-full sm:w-1/2 p-4 sm:p-6 flex flex-col items-center justify-between space-y-4 text-center">
          <p className="text-primary font-bold text-sm leading-relaxed">
            بعد الشراء، فريق مدرك يختار لك أفضل الأغنام أمامك على اللايف، وسيتم
            إرفاق صور الأغنام.
          </p>
          <img
            src={sheepIcon}
            alt="Sheep icon"
            className="w-16 h-16 object-contain"
          />
          <button
            type="button"
            onClick={() => openModal(QuantityModel)}
            className="bg-[#115B57] text-white p-3 rounded-xl font-bold w-full cursor-pointer hover:bg-opacity-90 transition-all"
          >
            اطلب فريق مدرك
          </button>
        </div>

        <div className="w-full sm:w-1/2 p-4 sm:p-6 flex flex-col items-center justify-between space-y-4 text-center border-t sm:border-t-0 sm:border-r border-gray-400">
          <p className="text-primary font-bold text-sm leading-relaxed">
            بعد الشراء، فريق مدرك يختار لك أفضل الأغنام أمامك على اللايف، وسيتم
            إرفاق صور الأغنام.
          </p>
          <img
            src={shepherdIcon}
            alt="Shepherd"
            className="w-16 h-16 object-contain"
          />
          <button
            onClick={() => openModal(DownloadAppModel)}
            type="button"
            className="bg-[#9A9A9A] text-white p-3 rounded-xl font-bold w-full cursor-pointer hover:bg-opacity-90 transition-all"
          >
            اطلب وكلم الراعي
          </button>
        </div>
      </div>
    </div>
  );
}
