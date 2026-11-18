import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";
import { AlertCircle, Loader2 } from "lucide-react";
import AliveOrderTracking from "../components/tracking order/AliveOrderTracking";
import LocationInfo from "../components/tracking order/LocationInfo";
import OrderPayMethod from "../components/tracking order/OrderPayMethod";
import {
  fetchOrderDetails,
  clearCurrentOrder,
  selectCurrentOrder,
  selectOrderDetailsLoading,
  selectOrdersError,
} from "../data/orders/ordersSlice";

function TrackingOrder() {
  const dispatch = useDispatch();
  const { id: routeId } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const loading = useSelector(selectOrderDetailsLoading);
  const currentOrder = useSelector(selectCurrentOrder);
  const error = useSelector(selectOrdersError);

  const orderId =
    routeId ||
    searchParams.get("order_id") ||
    searchParams.get("id") ||
    location.state?.orderId;

  const isWrongOrder =
    Boolean(currentOrder?.id) &&
    Boolean(orderId) &&
    String(currentOrder.id) !== String(orderId);

  useEffect(() => {
    if (!orderId) return;

    // 1. Initial fetch on entering the screen
    dispatch(fetchOrderDetails(orderId));

    // 2. Poll every 30 seconds silently in the background
    const intervalId = setInterval(() => {
      dispatch(fetchOrderDetails({ orderId, isPolling: true }));
    }, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, [dispatch, orderId]);

  // Clean up order state on unmount so re-entering the screen triggers clean initial loading
  useEffect(() => {
    return () => {
      dispatch(clearCurrentOrder());
    };
  }, [dispatch]);

  // Show loading spinner ONLY on initial screen entry when order data is not yet loaded
  const showInitialLoading =
    (loading && !currentOrder) ||
    (!currentOrder && orderId && !error) ||
    isWrongOrder;

  if (showInitialLoading) {
    return (
      <main className="app-container text-primary pt-30 min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-secondary" />
        <p className="font-bold text-lg text-primary">
          جاري تحميل بيانات تتبع الطلب...
        </p>
      </main>
    );
  }

  if (!orderId && !currentOrder) {
    return (
      <main className="app-container text-primary pt-30 min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
        <AlertCircle className="w-12 h-12 text-gray-400" />
        <p className="font-bold text-xl text-primary">
          لم يتم تحديد طلب لتتبعه
        </p>
        <Link
          to="/orders"
          className="bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-6 rounded-full transition"
        >
          الانتقال لطلباتي
        </Link>
      </main>
    );
  }

  if (error && !currentOrder) {
    return (
      <main className="app-container text-primary pt-30 min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="font-bold text-xl text-red-600">
          {typeof error === "string" ? error : "تعذر تحميل بيانات الطلب"}
        </p>
        {orderId && (
          <button
            type="button"
            onClick={() => dispatch(fetchOrderDetails(orderId))}
            className="bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-6 rounded-full transition cursor-pointer"
          >
            إعادة المحاولة
          </button>
        )}
      </main>
    );
  }

  return (
    <>
      <div className="px-2 py-3 text-white flex items-center justify-center flex-row text-center bg-primary-light mt-15">
        <p className="font-bold text-md md:text-2xl grow-8 px-16"> تتبع الطلب </p>
      </div>
      <main className="app-container text-primary space-y-6 pb-12">
        <OrderPayMethod />
        <LocationInfo />
        <AliveOrderTracking />
      </main>
    </>
  );
}

export default TrackingOrder;
