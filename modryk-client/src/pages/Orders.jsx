import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AlertCircle, Loader2, PackageOpen } from "lucide-react";
import PageTitle from "../shared components/PageTitle";
import PillHeading from "../shared components/PageHeading";
import OrdersList from "../components/orders/OrdersList";
import Pagination from "../shared components/ui/Pagination";
import {
  fetchOrders,
  selectOrders,
  selectOrdersError,
  selectOrdersLoading,
  selectOrdersPagination,
} from "../data/orders/ordersSlice";

const ORDERS_PER_PAGE = 10;

function Orders() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const orders = useSelector(selectOrders);
  const loading = useSelector(selectOrdersLoading);
  const error = useSelector(selectOrdersError);
  const pagination = useSelector(selectOrdersPagination);

  // Read current page from URL params (?page=1)
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const currentPage = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  useEffect(() => {
    dispatch(
      fetchOrders({
        page: currentPage,
        per_page: ORDERS_PER_PAGE,
      }),
    );
  }, [dispatch, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage === currentPage) return;
    setSearchParams({ page: String(newPage) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRetry = () => {
    dispatch(
      fetchOrders({
        page: currentPage,
        per_page: ORDERS_PER_PAGE,
      }),
    );
  };

  const hasOrders = Array.isArray(orders) && orders.length > 0;
  const lastPage = pagination?.lastPage || 1;

  return (
    <main className="app-container px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto pb-12">
      <PageTitle>{t("orders.title")}</PageTitle>
      <PillHeading>{t("orders.current")}</PillHeading>

      {/* 1. Loading State (initial or empty) */}
      {loading && !hasOrders && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-secondary" />
          <p className="font-bold text-lg text-primary">
            جاري تحميل قائمة الطلبات...
          </p>
        </div>
      )}

      {/* 2. Error State (initial or empty) */}
      {!loading && error && !hasOrders && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center px-4">
          <div className="flex items-center gap-2 text-red-600 font-bold text-lg">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <p>{error}</p>
          </div>
          <button
            type="button"
            onClick={handleRetry}
            className="btn btn-primary px-6 py-2.5 rounded-xl text-white font-bold cursor-pointer hover:bg-primary-dark transition"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* 3. Empty State */}
      {!loading && !error && !hasOrders && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center py-12 px-4 bg-white rounded-2xl border border-gray-200 shadow-xs mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <PackageOpen className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-primary">لا توجد طلبات حالياً</h3>
          <p className="text-gray-500 text-sm max-w-md">
            لم تقم بإنشاء أي طلبات بعد. يمكنك تصفح المتاجر واختيار الذبيحة المناسبة لك.
          </p>
          <Link
            to="/"
            className="btn btn-primary px-6 py-2.5 rounded-xl text-white font-bold cursor-pointer hover:bg-primary-dark transition"
          >
            تصفح المزارع
          </Link>
        </div>
      )}

      {/* 4. Loaded Orders List & Pagination */}
      {hasOrders && (
        <div className="flex flex-col gap-6">
          {error && (
            <div className="flex items-center justify-between gap-2 text-red-600 font-bold text-sm bg-red-50 border border-red-200 p-3 rounded-xl">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={handleRetry}
                className="text-xs bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 cursor-pointer"
              >
                إعادة المحاولة
              </button>
            </div>
          )}

          {/* Orders Container with subtle loading dimming during page transitions */}
          <div
            className={`transition-opacity duration-200 relative ${
              loading ? "opacity-60 pointer-events-none" : "opacity-100"
            }`}
          >
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/40 rounded-2xl backdrop-blur-[1px]">
                <Loader2 className="w-8 h-8 animate-spin text-secondary" />
              </div>
            )}
            <OrdersList orders={orders} />
          </div>

          {/* Pagination Controls */}
          {lastPage > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100">
              {pagination?.total > 0 && (
                <p className="text-sm font-semibold text-gray-500 text-center sm:text-right">
                  إجمالي الطلبات:{" "}
                  <span className="text-[#123340] font-bold">
                    {pagination.total}
                  </span>
                </p>
              )}

              <Pagination
                currentPage={pagination?.currentPage || currentPage}
                lastPage={lastPage}
                onPageChange={handlePageChange}
                disabled={loading}
                className="mx-auto sm:mx-0 sm:mr-auto"
              />
            </div>
          )}
        </div>
      )}
    </main>
  );
}

export default Orders;
