import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AlertCircle, Loader2, ShoppingBag, ShoppingCart } from "lucide-react";
import { useConfirmOrder } from "../hooks/useConfirmOrder";
import { useModal } from "../shared components/model/ModelContext";
import OrderSuccessModal from "../components/confirm order/models/OrderSuccessModal";
import ChargingTypes from "../components/confirm order/ChargingTypes";
import DeliveryMethods from "../components/confirm order/DeliveryMethods";
import OrderItemsDetails from "../components/confirm order/OrderItemsDetails";
import OrderSNotes from "../components/confirm order/OrderSNotes";
import OrgInfo from "../components/confirm order/OrgInfo";
import OrderSummary from "../components/confirm order/payement methods/OrderSummary";
import PayementMethods from "../components/confirm order/PayementMethods";

function ConfirmOrder() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { openModal } = useModal();

  const {
    loading,
    error,
    isCartEmpty,
    deliveryMethods,
    currentType,
    currentSubMethods,
    currentSubMethod,
    handleMethodChange,
    handleSubMethodChange,
    retryFetchCart,
  } = useConfirmOrder();

  // Handle return from payment gateway (e.g. ?payment_status=success&order_id=53 or ?success=true)
  useEffect(() => {
    const isSuccess =
      searchParams.get("payment_status") === "success" ||
      searchParams.get("success") === "true";
    const callbackOrderId =
      searchParams.get("order_id") || searchParams.get("id");

    if (isSuccess && callbackOrderId) {
      openModal(OrderSuccessModal, {
        hideCloseButton: true,
        dismissible: false,
        orderId: callbackOrderId,
        modalClassName: "max-w-[440px] rounded-2xl",
      });
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, openModal, setSearchParams]);

  if (loading && isCartEmpty) {
    return (
      <main className="app-container text-primary pt-30 min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-secondary" />
        <p className="font-bold text-lg text-primary">
          جاري تحميل بيانات السلة...
        </p>
      </main>
    );
  }

  if (error && isCartEmpty) {
    return (
      <main className="app-container text-primary pt-30 min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="flex items-center gap-2 text-red-600 font-bold text-lg">
          <AlertCircle className="w-6 h-6 shrink-0" />
          <p>{error}</p>
        </div>
        <button
          type="button"
          onClick={retryFetchCart}
          className="btn btn-primary px-6 py-2 rounded-xl text-white cursor-pointer"
        >
          إعادة المحاولة
        </button>
      </main>
    );
  }

  if (isCartEmpty) {
    return (
      <main className="app-container text-primary pt-30 min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="bg-white/80 border border-gray-200 rounded-3xl p-8 sm:p-10 shadow-sm max-w-md w-full text-center flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <ShoppingCart className="w-10 h-10" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-primary">
            السلة فارغة حالياً
          </h2>
          <p className="text-sm sm:text-base text-gray-500 font-medium leading-relaxed">
            لم تقم بإضافة أي طلبات إلى السلة بعد. تصفح المزارع المتاحة واختر ما
            يناسبك.
          </p>
          <Link
            to="/"
            className="btn btn-primary px-8 py-3 rounded-2xl text-white font-bold mt-2 inline-flex items-center gap-2 hover:opacity-90 transition-all"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>اذهب إلى التسوق</span>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="app-container text-primary pt-30">
      <OrgInfo />
      <OrderItemsDetails />
      <ChargingTypes
        setCurrentType={handleMethodChange}
        currentType={currentType}
        subMethods={currentSubMethods}
        deliveryMethods={deliveryMethods}
      />
      <DeliveryMethods
        subMethods={currentSubMethods}
        currentSubMethod={currentSubMethod}
        setCurrentSubMethod={handleSubMethodChange}
      />
      <PayementMethods />
      <OrderSummary />
      <OrderSNotes />
    </main>
  );
}

export default ConfirmOrder;
