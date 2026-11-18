import { useNavigate } from "react-router-dom";
import confirmIcon from "../../../../assets/confirmIcon.png";

export default function OrderSuccessModal({ onClose, orderId }) {
  const navigate = useNavigate();

  const handleTrackOrder = () => {
    if (onClose) onClose();
    navigate(orderId ? `/tracking-order?order_id=${orderId}` : "/tracking-order", {
      state: { orderId },
    });
  };

  const handleGoHome = () => {
    if (onClose) onClose();
    navigate("/");
  };

  return (
    <div className="w-full flex flex-col overflow-hidden text-center" dir="rtl">
      {/* Header */}
      <div className="bg-primary text-white py-4 px-6 text-center">
        <h2 className="text-lg sm:text-xl font-bold m-0">
          تم إكمال عملية الشراء
        </h2>
      </div>

      {/* Body */}
      <div className="bg-[#E6E6E6] py-8 px-6 flex flex-col items-center justify-center space-y-5">
        <p className="text-primary font-bold text-lg sm:text-xl m-0">
          تم إكمال عملية الشراء بنجاح
        </p>

        {/* Check Icon */}
        <div className="w-16 h-16 flex items-center justify-center">
          <img
            src={confirmIcon}
            alt="نجاح"
            className="w-16 h-16 object-contain"
          />
        </div>

        {orderId && (
          <div className="bg-white/90 border border-primary/20 px-4 py-1.5 rounded-full text-sm font-bold text-primary shadow-xs">
            رقم الطلب: #{orderId}
          </div>
        )}

        {/* Actions: تتبع الطلب / الذهاب للرئيسية */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full pt-2">
          <button
            type="button"
            onClick={handleTrackOrder}
            className="w-full sm:w-auto min-w-[140px] border border-gray-400 hover:border-primary text-primary font-bold text-base py-2.5 px-6 rounded-full hover:bg-gray-200 active:scale-95 transition-all cursor-pointer"
          >
            تتبع الطلب
          </button>

          <button
            type="button"
            onClick={handleGoHome}
            className="w-full sm:w-auto min-w-[140px] bg-primary text-white hover:bg-primary-dark font-bold text-base py-2.5 px-6 rounded-full active:scale-95 transition-all cursor-pointer shadow-sm"
          >
            الذهاب للرئيسية
          </button>
        </div>
      </div>
    </div>
  );
}
