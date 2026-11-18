import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";

export default function Modal({
  onClose,
  children,
  className = "",
  hideCloseButton = false,
  dismissible = true,
}) {
  const { t } = useTranslation();

  // إغلاق بزرار Escape + قفل سكرول الصفحة
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape" && dismissible) onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, dismissible]);

  const defaultClasses = "bg-white max-w-[420px]";
  const resolvedClasses = className
    ? `${className} ${
        !className.includes("max-w-") && !className.includes("max-w-[")
          ? "max-w-[420px]"
          : ""
      }`
    : defaultClasses;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex justify-center items-center bg-black/50 p-4"
      onClick={dismissible ? onClose : undefined}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-h-[85vh] rounded-2xl shadow-xl flex flex-col overflow-hidden ${resolvedClasses}`}
      >
        {!hideCloseButton && (
          <button
            type="button"
            onClick={onClose}
            aria-label={t("actions.close")}
            className="absolute top-3 left-3 z-20 bg-gray-100 border-none rounded-full w-8 h-8 flex items-center justify-center cursor-pointer text-gray-500 hover:bg-secondary hover:text-white transition-colors shadow-sm"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        )}

        {children}
      </div>
    </div>,
    document.body,
  );
}
