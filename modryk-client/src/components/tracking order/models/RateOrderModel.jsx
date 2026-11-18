import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AlertCircle, CheckCircle2, Loader2, Star } from "lucide-react";
import {
  selectCurrentOrder,
  submitOrderRating,
} from "../../../data/orders/ordersSlice";
import { useToast } from "../../../shared components/toast";

function StarRating({ value, onChange, label }) {
  const [hoverValue, setHoverValue] = useState(0);

  const ratingDescriptions = {
    1: "سيء",
    2: "مقبول",
    3: "جيد",
    4: "جيد جداً",
    5: "ممتاز",
  };

  const currentDisplay = hoverValue || value;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-bold text-gray-700">{label}</span>
        <span className="text-secondary font-bold text-xs sm:text-sm bg-[#E2F1F4] px-2.5 py-0.5 rounded-full">
          {ratingDescriptions[currentDisplay] || `${currentDisplay}/5`}
        </span>
      </div>

      <div className="flex items-center justify-center gap-1.5 py-2 bg-gray-50/80 rounded-xl border border-gray-100" dir="ltr">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= (hoverValue || value);
          return (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              onMouseEnter={() => setHoverValue(star)}
              onMouseLeave={() => setHoverValue(0)}
              className="p-1 cursor-pointer transition-transform duration-150 hover:scale-120 focus:outline-hidden"
              aria-label={`${star} من 5 نجوم`}
            >
              <Star
                className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                  isFilled
                    ? "fill-amber-400 text-amber-400 drop-shadow-xs"
                    : "fill-none text-gray-300 hover:text-amber-200"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function RateOrderModel({ orderId, farm, onClose }) {
  const dispatch = useDispatch();
  const { showSuccess } = useToast();
  const currentOrder = useSelector(selectCurrentOrder);

  const [farmRating, setFarmRating] = useState(5);
  const [farmReview, setFarmReview] = useState("");
  const [serviceRating, setServiceRating] = useState(5);
  const [serviceReview, setServiceReview] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const resolvedOrderId = orderId || currentOrder?.id;
  const resolvedFarm = farm || currentOrder?.farm;
  const farmName = resolvedFarm?.name || "المزرعة";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!resolvedOrderId) {
      setErrorMessage("رقم الطلب غير متوفر لإرسال التقييم");
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    const ratingParams = {
      order_id: Number(resolvedOrderId),
      farm_rating: Number(farmRating),
      service_rating: Number(serviceRating),
      farm_review: farmReview.trim(),
      service_review: serviceReview.trim(),
    };

    try {
      await dispatch(submitOrderRating(ratingParams)).unwrap();

      setIsSubmitted(true);
      showSuccess("تم إرسال تقييمك بنجاح، شكراً لمشاركتك!");

      // Close modal after brief success presentation
      setTimeout(() => {
        if (onClose) onClose();
      }, 1800);
    } catch (err) {
      console.error("Failed to submit rating:", err);
      const message =
        typeof err === "string"
          ? err
          : err?.message || "فشل إرسال التقييم، يرجى المحاولة مرة أخرى";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col overflow-hidden text-right" dir="rtl">
      {/* Header */}
      <div className="bg-primary text-white py-4 px-6 text-center">
        <h2 className="text-lg sm:text-xl font-bold m-0">تقييم الطلب</h2>
        <p className="text-xs text-white/80 mt-1">
          رأيك يهمنا لتحسين جودة الذبائح والخدمات المقدمة
        </p>
      </div>

      {/* Body */}
      {isSubmitted ? (
        <div className="p-8 flex flex-col items-center justify-center text-center space-y-4 bg-white animate-fadeIn">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-primary">تم إرسال تقييمك بنجاح!</h3>
          <p className="text-sm text-gray-600 max-w-xs">
            شكراً لوقتك ومشاركتنا رأيك، نسعى دائماً لتقديم أفضل تجربة لكم.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-2 bg-primary hover:bg-[#154554] text-white font-bold text-sm py-2 px-8 rounded-full transition shadow-sm cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[70vh] bg-white">
          {/* Farm Rating Section */}
          <div className="space-y-3 p-4 rounded-2xl bg-gray-50/70 border border-gray-100">
            <StarRating
              value={farmRating}
              onChange={setFarmRating}
              label={`تقييم جودة الذبيحة (${farmName}):`}
            />

            <div>
              <label
                htmlFor="farm-review"
                className="block text-xs font-semibold text-gray-600 mb-1.5"
              >
                تعليقك على المزرعة وجودة الذبيحة:
              </label>
              <textarea
                id="farm-review"
                name="farm_review"
                rows="3"
                value={farmReview}
                onChange={(e) => setFarmReview(e.target.value)}
                placeholder="اكتب ملاحظاتك حول جودة الذبيحة، النظافة والتقطيع (اختياري)..."
                className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-800 placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-hidden resize-none transition"
              />
            </div>
          </div>

          {/* Service Rating Section */}
          <div className="space-y-3 p-4 rounded-2xl bg-gray-50/70 border border-gray-100">
            <StarRating
              value={serviceRating}
              onChange={setServiceRating}
              label="تقييم التوصيل ومستوى الخدمة:"
            />

            <div>
              <label
                htmlFor="service-review"
                className="block text-xs font-semibold text-gray-600 mb-1.5"
              >
                تعليقك على خدمة التوصيل:
              </label>
              <textarea
                id="service-review"
                name="service_review"
                rows="3"
                value={serviceReview}
                onChange={(e) => setServiceReview(e.target.value)}
                placeholder="اكتب ملاحظاتك حول دقة الموعد وسرعة التوصيل (اختياري)..."
                className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-800 placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-hidden resize-none transition"
              />
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-center gap-2 text-red-600 font-bold text-xs sm:text-sm bg-red-50 border border-red-200 p-3 rounded-xl animate-fadeIn">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-primary hover:bg-[#154554] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm sm:text-base py-3 px-6 rounded-full shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري الإرسال...</span>
                </>
              ) : (
                <span>إرسال التقييم</span>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm sm:text-base py-3 px-6 rounded-full transition cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
