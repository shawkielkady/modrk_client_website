import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import { useTranslation } from "react-i18next";
import OrderInfoRow from "./OrderInfoRow";

const STATUS_STYLES = {
  delivered: "text-green-600 font-bold",
  completed: "text-green-600 font-bold",
  pending: "text-amber-600 font-bold",
  processing: "text-blue-600 font-bold",
  cancelled: "text-red-600 font-bold",
};

export default function OrderCard({ order }) {
  const { t } = useTranslation();

  if (!order) return null;

  const orderId = order.id ?? order.order_id ?? "";
  const orderNumber =
    order.number ||
    order.order_number ||
    order.code ||
    (orderId ? `#${orderId}` : "-");

  const rawDate = order.date || order.created_at || order.delivery_date || "";
  const orderDate = rawDate.includes("T") ? rawDate.split("T")[0] : rawDate;

  // Handle status whether it is an object { name, slug } or string
  const statusSlug =
    typeof order.status === "object" && order.status !== null
      ? order.status.slug || order.status.name || ""
      : String(order.status || "");

  const statusLabel =
    typeof order.status === "object" && order.status?.name
      ? order.status.name
      : t(`orders.statuses.${statusSlug}`, { defaultValue: statusSlug || "-" });

  const statusStyle = STATUS_STYLES[statusSlug] || "text-primary font-bold";

  return (
    <div className="order-card p-4 sm:p-6 md:px-10 lg:px-16 rounded-2xl bg-white border border-gray-200 shadow-sm transition hover:shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 items-center">
        <div className="md:col-span-3 flex flex-col gap-3 text-base sm:text-lg lg:text-xl text-primary min-w-0">
          <OrderInfoRow
            label={t("orders.number")}
            value={orderNumber}
            valueClassName="break-all"
          />
          <OrderInfoRow label={t("orders.date")} value={orderDate || "-"} />
          <OrderInfoRow
            label={t("orders.status")}
            value={statusLabel}
            valueClassName={statusStyle}
          />
        </div>

        <div className="md:col-span-1">
          <Link
            to={orderId ? `/tracking-order?order_id=${orderId}` : "/tracking-order"}
            state={{ orderId }}
            className="flex items-center justify-center gap-2 px-3 py-2 sm:py-3 rounded-full bg-primary hover:bg-primary-dark transition active:scale-95 w-full max-w-xs mx-auto text-base sm:text-lg lg:text-xl font-bold text-center text-white"
          >
            <Eye className="w-5 h-5" />
            {t("orders.details")}
          </Link>
        </div>
      </div>
    </div>
  );
}
