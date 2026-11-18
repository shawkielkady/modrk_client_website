import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useModal } from "../../shared components/model/ModelContext";
import {
  selectCartSubmitting,
  selectSubmitCartDataWrapper,
  submitCheckout,
  updateSubmitCartData,
} from "../../data/cart/cartSlice";
import validateCheckoutData from "../../data/cart/orderValidation";
import OrderSuccessModal from "./models/OrderSuccessModal";
import { AlertCircle, Loader2 } from "lucide-react";

function OrderSNotes() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { openModal } = useModal();
  const submitCartDataWrapper = useSelector(selectSubmitCartDataWrapper);
  const isSubmitting = useSelector(selectCartSubmitting);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const notes = submitCartDataWrapper?.notes ?? "";

  const handleNotesChange = (e) => {
    if (errorMessage) setErrorMessage(null);
    dispatch(updateSubmitCartData({ notes: e.target.value }));
  };

  const handleNext = async () => {
    if (isSubmitting || isRedirecting) return;

    // 1. Client-side validation check
    const { isValid, error } = validateCheckoutData(submitCartDataWrapper);
    if (!isValid) {
      setErrorMessage(error);
      return;
    }
    setErrorMessage(null);

    // 2. Dispatch submit checkout to backend
    try {
      const result = await dispatch(
        submitCheckout(submitCartDataWrapper),
      ).unwrap();

      const paymentUrl =
        result?.payment_url ||
        result?.data?.payment_url ||
        null;

      const orderId =
        result?.order_id ??
        result?.data?.order_id ??
        result?.id ??
        null;

      // 3. If payment_url returned from backend, open in a new tab/page
      if (paymentUrl) {
        const opened = window.open(paymentUrl, "_blank");
        if (!opened || opened.closed || typeof opened.closed === "undefined") {
          setIsRedirecting(true);
          window.location.href = paymentUrl;
        }
        return;
      }

      // 4. If no payment_url (e.g. Cash on Delivery), open success modal directly
      openModal(OrderSuccessModal, {
        hideCloseButton: true,
        dismissible: false,
        orderId,
        modalClassName: "max-w-[440px] rounded-2xl",
      });
    } catch (err) {
      console.error("Order submission failed:", err);
      const message =
        typeof err === "string"
          ? err
          : err?.message || "فشل إتمام الطلب، يرجى المحاولة مرة أخرى";
      setErrorMessage(message);
    }
  };

  return (
    <div className="py-6 md:py-8 px-4 md:px-0">
      <div className="w-full mx-auto md:w-[70%]">
        <h2 className="font-bold text-xl md:text-2xl mb-4 text-right">
          ملاحظات الطلب:
        </h2>
        <textarea
          id="order-notes"
          name="notes"
          rows="4"
          value={notes}
          onChange={handleNotesChange}
          disabled={isSubmitting || isRedirecting}
          placeholder="ملاحظات"
          className="w-full rounded-2xl border border-gray-300 bg-white px-5 py-4 text-right text-base text-[#123340] placeholder-gray-400 resize-none focus:border-[#123340] focus:ring-0 transition disabled:opacity-60 disabled:cursor-not-allowed"
        ></textarea>

        {errorMessage && (
          <div className="flex items-center gap-2 text-red-600 font-bold text-sm md:text-base mt-3 bg-red-50 border border-red-200 p-3 rounded-xl animate-fadeIn">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="flex items-center justify-between mt-8">
          <button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting || isRedirecting}
            className="bg-[#123340] hover:bg-[#154554] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-base md:text-lg py-3 px-8 md:px-10 rounded-full shadow-md transition-all duration-200 cursor-pointer flex items-center gap-2"
          >
            {isRedirecting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>جاري التحويل لصفحة الدفع...</span>
              </>
            ) : isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>جاري تأكيد الطلب...</span>
              </>
            ) : (
              <span>التالي</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={isSubmitting || isRedirecting}
            className="bg-[#D0D0D0] hover:bg-[#c2c2c2] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-[#123340] font-bold text-base md:text-lg py-3 px-8 md:px-10 rounded-full shadow-sm transition-all duration-200 cursor-pointer flex items-center gap-2"
          >
            رجوع
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderSNotes;
