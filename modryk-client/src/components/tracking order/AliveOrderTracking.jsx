import { useSelector } from "react-redux";
import { Video } from "lucide-react";

function AliveOrderTracking({ initialStep = 0 }) {
  const currentOrder = useSelector((state) => state.orders?.currentOrder);
  const currentStatus = currentOrder?.status;
  const availableStatuses = currentOrder?.available_statuses || [];

  const currentStep =
    currentStatus !== undefined
      ? currentStatus
      : availableStatuses.length > 0
        ? availableStatuses[0]
        : initialStep;

  const currentStepId = currentStep?.id;
  const currentIndex = availableStatuses.findIndex(
    (s) => s.id === currentStepId,
  );

  return (
    <div
      className="py-4 space-y-4 w-full mx-auto md:w-[70%] text-right"
      dir="rtl"
    >
      <h2 className="font-bold text-2xl text-primary">تتبع الطلب: </h2>

      {/* tracking alive order stepper */}
      <ul className="space-y-6 md:space-y-12 alive-order-steps">
        {availableStatuses.map((step, index) => {
          const isCompleted =
            currentIndex !== -1
              ? index < currentIndex
              : step.id < (currentStepId || 0);
          const isCurrent = step.id === currentStepId;
          const iconSrc = step.image;
          const boxBgClass =
            isCompleted || isCurrent ? "bg-primary" : "bg-[#D0D0D0]";
          const hasLiveUrl = Boolean(step.live_url && step.live_url !== "null");

          return (
            <li key={step.id} className="flex gap-3 md:gap-6 items-center">
              <div
                className={`shrink-0 py-2 px-4 md:py-3 md:px-6 shadow-2xl rounded-2xl md:rounded-3xl transition-colors duration-300 step-icon-box-alive ${boxBgClass}`}
              >
                {iconSrc ? (
                  <img
                    src={iconSrc}
                    className="h-12 w-10 md:h-18 md:w-15 object-contain transition-all"
                    alt={`خطوة ${index + 1}`}
                  />
                ) : (
                  <div className="h-12 w-10 md:h-18 md:w-15 flex items-center justify-center text-white font-bold text-lg">
                    {index + 1}
                  </div>
                )}
              </div>

              <div className="flex flex-1 min-w-0 flex-col items-start gap-2 md:flex-row md:items-center md:gap-6">
                <p className="text-primary font-bold text-sm sm:text-base md:text-2xl">
                  {step.name}
                </p>

                {/* الزر يظهر في أي خطوة يتوفر بها رابط بث مباشر live_url */}
                {hasLiveUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      if (step.live_url) {
                        window.open(step.live_url, "_blank");
                      }
                    }}
                    className="shrink-0 text-white text-sm md:text-base cursor-pointer rounded-xl md:rounded-2xl flex items-center gap-2 px-3 py-1.5 md:p-2 bg-secondary hover:opacity-90 active:scale-95 transition-all font-bold shadow-sm"
                  >
                    <span>شاهد</span>
                    <Video className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default AliveOrderTracking;
