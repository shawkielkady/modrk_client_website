import { AlarmClockCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatTime } from "../../hooks/FormatTime";

export default function CartTimer({ remaining, isExpired }) {
  const { t } = useTranslation();

  return (
    <div
      className={`timer-card mt-2 p-2 rounded-2xl flex items-center justify-center gap-2 w-full max-w-md mx-auto text-center ${
        isExpired ? "bg-secondary text-white" : "bg-[#F2F2F2] text-secondary"
      }`}
    >
      {isExpired ? (
        t("cart.expired")
      ) : (
        <>
          <p className="text-md">{t("cart.timerHint")}</p>
          <AlarmClockCheck />
          <span className="timer-text">{formatTime(remaining)}</span>
        </>
      )}
    </div>
  );
}
