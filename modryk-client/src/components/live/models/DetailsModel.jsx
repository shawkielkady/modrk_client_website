import { useSelector } from "react-redux";
import { selectSelectedFarm } from "../../../data/farms/farmsSlice";

export default function DetailsModel({ farm }) {
  const reduxFarm = useSelector(selectSelectedFarm);
  const data = farm || reduxFarm || {};

  return (
    <div className="w-full bg-primary text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-3.5 border-b border-white/10">
        <div className="flex-1 text-right">
          <h2 className="text-2xl font-extrabold text-white m-0 leading-snug">
            {data.name || "التفاصيل"}
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 text-lg space-y-4 text-right">
        <div className="flex justify-between items-center pb-2 border-b border-white/10">
          <span className="text-gray-300 font-medium">النوع:</span>
          <span className="font-bold text-white">
            {data.farm_type || "حري"}
          </span>
        </div>
        <div className="flex justify-between items-center pb-2 border-b border-white/10">
          <span className="text-gray-300 font-medium">الوزن:</span>
          <span className="font-bold text-white">
            {data.farm_weight_from && data.farm_weight_to
              ? `${data.farm_weight_from} - ${data.farm_weight_to} كيلو`
              : "22 - 24 كيلو"}
          </span>
        </div>
        <div className="flex justify-between items-center pb-2 border-b border-white/10">
          <span className="text-gray-300 font-medium">العمر:</span>
          <span className="font-bold text-white">
            {data.age ? `${data.age}` : "6 شهور"}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-300 font-medium">السعر:</span>
          <span className="font-bold text-secondary-light text-xl">
            {data.average_price
              ? `${Math.round(data.average_price)} ريال`
              : "1450 ريال"}
          </span>
        </div>
      </div>
    </div>
  );
}
