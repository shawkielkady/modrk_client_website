import { CircleUser, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import StarRating from "../../shared components/StarsRatings";
import {
  selectSelectedFarm,
  selectFarmRatings,
  selectFarmRatingsLoading,
} from "../../data/farms/farmsSlice";

const formatDate = (iso, lng) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return String(iso);
    return new Intl.DateTimeFormat(`${lng}-u-nu-latn`, {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(d);
  } catch {
    return String(iso);
  }
};

// محتوى المودال بتاع المؤسسة، بيتعرض جوه <Modal> عن طريق openModal
export default function OrgDetailsModal({ org, farm }) {
  const { t, i18n } = useTranslation();
  const lng = (i18n.resolvedLanguage || "ar").split("-")[0];

  const reduxFarm = useSelector(selectSelectedFarm);
  const reduxRatings = useSelector(selectFarmRatings);
  const ratingsLoading = useSelector(selectFarmRatingsLoading);

  const targetId = farm?.id ?? org?.id;
  const currentFarm =
    reduxFarm && (!targetId || reduxFarm.id === targetId)
      ? reduxFarm
      : farm || org || reduxFarm || {};

  const farmName = currentFarm.name || "";
  const crNumber = currentFarm.commercial_number || currentFarm.crNumber || "-";
  const penNumber = currentFarm.farm_no || currentFarm.penNumber || "-";
  const avatar = currentFarm.image || currentFarm.avatar || "";
  const rating = Number(currentFarm.rating) || 5;

  const reviews =
    Array.isArray(reduxRatings) && reduxRatings.length > 0
      ? reduxRatings
      : Array.isArray(currentFarm.reviews)
        ? currentFarm.reviews
        : [];

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-3.5 border-b border-gray-100">
        <div className="flex-1 text-right">
          <h2 className="text-[1.05rem] font-extrabold text-primary-dark m-0 mb-1 leading-snug">
            {farmName}
          </h2>
          <p className="text-xs text-gray-500 m-0">
            {t("product.cr", { value: crNumber })} &nbsp;|&nbsp;{" "}
            {t("product.pen", { value: penNumber })}
          </p>
        </div>
        <div className="w-14 h-14 rounded-full bg-secondary overflow-hidden shrink-0 flex items-center justify-center">
          {avatar ? (
            <img
              src={avatar}
              alt={farmName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white font-bold text-lg">
              {farmName ? farmName.charAt(0) : ""}
            </span>
          )}
        </div>
      </div>

      {/* Rating summary */}
      <div className="px-5 py-2.5 border-b border-gray-100">
        <div className="flex items-center gap-2.5 flex-row-reverse justify-end">
          <span className="flex items-center gap-0.5 text-yellow-400 flex-row-reverse">
            <StarRating rating={rating} />
            <span className="text-xs text-gray-700 mr-0.5">({rating})</span>
          </span>
          <span className="text-xs font-bold text-secondary text-right">
            {t("orgModal.verifiedReviews")}
          </span>
        </div>
      </div>

      <div className="px-5 pt-3 pb-1.5 text-sm font-extrabold text-primary-dark text-right shrink-0">
        {t("orgModal.reviewsTitle")}
      </div>

      {/* Reviews */}
      <div className="overflow-y-auto flex-1 px-5 pb-4 flex flex-col gap-0.5">
        {ratingsLoading ? (
          <div className="flex items-center justify-center py-8 text-gray-500 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-secondary" />
            <span className="text-xs">{t("orgModal.loadingReviews")}</span>
          </div>
        ) : reviews.length > 0 ? (
          reviews.map((review, idx) => {
            const customerName =
              review.customer?.name ||
              review.customerName ||
              review.name ||
              t("common.customer", "عميل");
            const reviewRating = Number(
              review.farm_rating ?? review.rating ?? 5,
            );
            const reviewDate = review.created_at || review.date;
            const reviewComment =
              review.farm_review ||
              review.comment ||
              review.service_review ||
              "";

            return (
              <div
                key={review.id || idx}
                className="py-2.5 border-b border-gray-100 text-right"
              >
                <div className="flex items-center gap-2 mb-1">
                  <CircleUser className="w-7 h-7 text-gray-400" />
                  <span className="text-sm font-bold text-gray-800">
                    {customerName}
                  </span>
                </div>
                <div className="flex items-center gap-0.5 mb-1">
                  <StarRating rating={reviewRating} size="w-3.5 h-3.5" />
                  {reviewDate && (
                    <span className="text-[0.72rem] text-gray-400 mr-1.5">
                      {formatDate(reviewDate, lng)}
                    </span>
                  )}
                </div>
                {reviewComment && (
                  <p className="text-xs text-gray-500 m-0 leading-relaxed">
                    {reviewComment}
                  </p>
                )}
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center text-xs text-gray-400">
            {t("orgModal.noReviews")}
          </div>
        )}
      </div>
    </>
  );
}
