import { EllipsisVertical, MessageSquareText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";

import StarRating from "./StarsRatings";
import { useModal } from "./model/ModelContext";
import OrgDetailsModal from "../components/home/OrgDetailsModel";
import { fetchFarmDetails, fetchFarmRatings } from "../data/farms/farmsSlice";

import tamaraBadge from "../../assets/tamaraitemcard.png";
import currencyIcon from "../../assets/currency.png";
import { Link } from "react-router-dom";

export default function ProductCard({ farm }) {
  const { t } = useTranslation();
  const { openModal } = useModal();
  const dispatch = useDispatch();

  const handleOpenOrgModal = () => {
    if (farm?.id) {
      dispatch(
        fetchFarmDetails({
          farmId: farm.id,
          farmTypeId: farm.farm_type_id || farm.farmTypeId,
        }),
      );
      dispatch(fetchFarmRatings({ farmId: farm.id, page: 1 }));
    }
    openModal(OrgDetailsModal, { farm, org: farm });
  };

  return (
    <div className="relative item-card w-full h-[300px] rounded-xl bg-[#ddd] overflow-hidden shadow-md">
      <img
        src={farm.image}
        alt={farm.breed}
        className="w-full h-full object-cover z-1"
      />

      {/* Top bar */}
      <div className="absolute w-full flex cursor-pointer justify-between z-2 top-2 text-black px-4">
        <button
          type="button"
          onClick={handleOpenOrgModal}
          aria-label={t("product.orgDetails")}
          className="p-1 rounded-full bg-secondary text-white transition-all h-8 cursor-pointer"
        >
          <EllipsisVertical />
        </button>

        <div className="flex flex-col gap-2 items-center">
          <Link
            to={`/live/${farm.id}`}
            type="button"
            className="text-xs p-1 rounded-full bg-secondary text-white transition-all px-2"
          >
            {t("product.goLive")}
          </Link>
          {farm.has_tamara && (
            <img
              src={tamaraBadge}
              alt="Tamara"
              className="w-[50%] h-full object-cover"
            />
          )}
        </div>
      </div>

      {/* Bottom details */}
      <div className="absolute bottom-0 w-full">
        <div className="bg-[#1545548A] px-2 w-full h-[70px] pt-1">
          <div className="flex justify-between items-center gap-2 text-white">
            <div
              className="w-5 h-5 rounded-full"
              style={{ backgroundColor: farm.color }}
            ></div>
            <p className="text-sm"> {farm.name}</p>
            <p className="text-sm border-r border-white pr-2">
              {farm.farm_type}
            </p>
            {farm.farm_type_image && (
              <img src={farm.farm_type_image} alt="" className="h-12" />
            )}
          </div>

          <div className="flex justify-between items-center gap-2 text-white text-[10px]">
            <p>{t("product.cr", { value: farm.commercial_number })}</p>
            <p>{t("product.pen", { value: farm.farm_no })}</p>
            <div
              onClick={handleOpenOrgModal}
              className="flex items-center gap-1 ratings text-yellow-400 cursor-pointer"
            >
              <StarRating rating={5} className="gap-1" />
              <span>({farm.rating})</span>
            </div>
            <div
              onClick={handleOpenOrgModal}
              className="flex items-center gap-1 cursor-pointer"
            >
              <p>{t("product.comments")}</p>
              <MessageSquareText className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="bg-primary p-2 text-white text-sm flex justify-between items-center">
          <p>
            {"الوزن"} {farm.farm_weight_from} - {farm.farm_weight_to} كيلو
          </p>
          <p>{t("product.age", { value: farm.age })}</p>
          <p className="flex items-center gap-1">
            {t("product.price", { value: Math.round(farm.average_price) })}
            <img src={currencyIcon} alt="" className="h-4 w-4" />
          </p>
        </div>
      </div>
    </div>
  );
}
