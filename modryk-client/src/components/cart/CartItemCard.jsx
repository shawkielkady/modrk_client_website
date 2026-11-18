import { ReceiptText } from "lucide-react";
import { useTranslation } from "react-i18next";

import InfoGrid from "./InfoGrid";
import CartTimer from "./CartTimer";
import useCountdown from "../../hooks/UseCountDown";

export default function CartItemCard({ item, onConfirm, onReorder }) {
  const { t } = useTranslation();
  const { remaining, isExpired } = useCountdown(item.expiresAt);

  const rows = [
    {
      key: "number",
      label: t("orders.number"),
      value: item.number,
      valueClassName: "break-all",
    },
    { key: "date", label: t("orders.date"), value: item.date },
    { key: "type", label: t("cart.type"), value: item.type },
    { key: "quantity", label: t("cart.quantity"), value: item.quantity },
    {
      key: "price",
      label: t("cart.price"),
      value: t("cart.priceValue", { value: item.price }),
    },
  ];

  const handleAction = () => {
    if (isExpired) onReorder?.(item);
    else onConfirm?.(item);
  };

  return (
    <div className="order-card p-4 sm:p-6 md:px-10 lg:px-16 rounded-2xl bg-white border border-gray-200 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 items-center">
        <InfoGrid rows={rows} className="md:col-span-3" />

        <div className="md:col-span-1">
          <button
            type="button"
            onClick={handleAction}
            className="flex items-center justify-center gap-2 px-3 py-2 sm:py-3 rounded-full bg-primary w-full max-w-xs mx-auto text-base sm:text-xl lg:text-2xl font-bold text-center text-white"
          >
            {isExpired ? (
              t("cart.reorder")
            ) : (
              <>
                <ReceiptText />
                {t("cart.confirm")}
              </>
            )}
          </button>
        </div>
      </div>

      <CartTimer remaining={remaining} isExpired={isExpired} />
    </div>
  );
}
