import { formatTimee } from "@/hooks/FormatTime";
import { MapPin, RotateCw } from "lucide-react";
import { useSelector } from "react-redux";
import { useModal } from "../../shared components/model/ModelContext";
import CheckItemsModel from "./models/CheckItemsModel";
import RateOrderModel from "./models/RateOrderModel";

function LocationInfo() {
  const { openModal } = useModal();
  const currentOrder = useSelector((state) => state.orders?.currentOrder);
  const customer_address = currentOrder?.customer_address || "";
  const farm = currentOrder?.farm;
  const deliveryTime = currentOrder?.delivery_time;
  const date = currentOrder?.delivery_date || "";
  const total = currentOrder?.total ?? 0;

  const handleOpenCheckItemsModal = () => {
    openModal(CheckItemsModel, {
      order: currentOrder,
      modalClassName: "max-w-[440px] rounded-2xl",
    });
  };

  const handleOpenRateModal = () => {
    openModal(RateOrderModel, {
      orderId: currentOrder?.id,
      farm: currentOrder?.farm,
      modalClassName: "max-w-[480px] rounded-2xl",
    });
  };

  const formattedDeliveryTime =
    typeof deliveryTime === "object" && deliveryTime !== null
      ? `من ${formatTimee(deliveryTime.from)} إلى ${formatTimee(deliveryTime.to)}`
      : deliveryTime
        ? String(deliveryTime)
        : "";

  return (
    <div>
      {customer_address && (
        <div className="py-4 space-y-4 w-full mx-auto md:w-[70%]">
          <h2 className="font-bold text-2xl"> موقع التسليم: </h2>
          <button
            type="button"
            id="addressSelectBtn"
            className="text-primary font-bold gap-4 text-base md:text-xl py-2 px-4 md:px-10 mx-auto w-100 justify-center text-center rounded-4xl bg-[#D0D0D0] hover:bg-[#c2c2c2] transition flex items-center"
          >
            <MapPin className="w-5 h-5 text-primary" /> {customer_address}
          </button>
        </div>
      )}

      {farm && (
        <div className="p-4 sm:p-6 md:p-8 rounded-3xl md:rounded-4xl bg-[#C5D6DD] w-full mx-auto md:w-[70%]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-1 min-w-0 items-center gap-3 md:gap-6 py-4 md:py-6 border-b border-b-gray-300">
              <div
                className="rounded-full shrink-0 w-12 h-12 md:w-15 md:h-15 "
                style={{ backgroundColor: farm.color || "#123340" }}
              ></div>

              <div className="min-w-0 font-bold text-base md:text-xl">
                <p> {farm.name} </p>
                <div className="flex flex-wrap items-center gap-x-2 text-sm md:text-xl">
                  {farm.commercial_number && (
                    <p>س . ت: {farm.commercial_number}</p>
                  )}
                  {farm.commercial_number && farm.farm_no && <span>|</span>}
                  {farm.farm_no && <p>حظيرة: {farm.farm_no}</p>}
                </div>
              </div>
            </div>

            <img
              src="./assets/sheepbadge.svg"
              className="shrink-0 w-14 h-14 sm:w-20 sm:h-20 md:w-25 md:h-25"
              alt=""
            />
          </div>

          <div className="flex flex-wrap items-center justify-between md:justify-start gap-x-3 gap-y-2 md:gap-10 text-base sm:text-xl md:text-2xl font-bold mt-4">
            {(farm.farm_weight_from || farm.farm_weight_to) && (
              <div className="flex items-center gap-2">
                <span>
                  {farm.farm_weight_from} - {farm.farm_weight_to}
                </span>
                <img
                  src="./assets/Weighticon.png"
                  className="shrink-0 h-6 w-6 md:h-10 md:w-10"
                  alt=""
                />
              </div>
            )}

            {(farm.farm_weight_from || farm.farm_weight_to) && farm.farm_type && (
              <span>|</span>
            )}

            {farm.farm_type && (
              <div className="flex items-center gap-2">
                <span>{farm.farm_type}</span>
                {farm.farm_type_image && (
                  <img
                    src={`${farm.farm_type_image}`}
                    className="shrink-0 h-6 w-6 md:h-10 md:w-10"
                    alt=""
                  />
                )}
              </div>
            )}

            {farm.farm_type && <span>|</span>}

            <div className="flex items-center gap-2">
              <span>{total}</span>
              <img
                src="./assets/currencyprimary.png"
                className="shrink-0 h-6 w-6 md:h-10 md:w-10"
                alt=""
              />
            </div>
          </div>

          <div className="flex flex-col min-[400px]:flex-row gap-3 md:gap-6 md:justify-end mt-3">
            <button
              type="button"
              onClick={handleOpenCheckItemsModal}
              className="flex-1 md:flex-none font-bold py-2.5 md:py-3.5 px-4 md:px-10 text-sm md:text-base rounded-full cursor-pointer bg-[#D9D9D9] text-[#123340] hover:bg-[#c8c8c8] active:scale-95 transition-all shadow-xs"
            >
              فحص الطلب
            </button>
            <button
              type="button"
              onClick={handleOpenRateModal}
              className="flex-1 md:flex-none font-bold py-2.5 md:py-3.5 px-6 md:px-10 text-sm md:text-base rounded-full cursor-pointer bg-primary text-white hover:bg-[#154554] active:scale-95 transition-all shadow-sm"
            >
              تقييم
            </button>
          </div>
        </div>
      )}

      <div className="py-4 space-y-4 w-full mx-auto md:w-[70%] flex gap-4 items-center">
        <img src="./assets/wait icon.svg" className="w-10" alt="" />
        <p className="font-bold text-xl">
          سيتم تجهيز طلبكم عند بدء اوقات العمل الرسمية
        </p>
      </div>

      {(date || formattedDeliveryTime) && (
        <div className="py-2 px-3 w-full mx-auto md:w-[70%] flex flex-wrap gap-x-2 gap-y-1 justify-center items-center bg-[#F3F3F3] rounded-4xl font-bold text-sm md:text-base">
          <span className="text-gray-500">يصل طلبك</span>
          {date && <span>{date}</span>}
          {date && formattedDeliveryTime && (
            <RotateCw className="w-4 h-4 text-primary shrink-0" />
          )}
          {formattedDeliveryTime && (
            <span className="whitespace-nowrap">{formattedDeliveryTime}</span>
          )}
        </div>
      )}
    </div>
  );
}

export default LocationInfo;
