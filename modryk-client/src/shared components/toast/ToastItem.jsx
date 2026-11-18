import { useEffect, useState, useRef } from "react";
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

const CONFIGS = {
  error: {
    icon: AlertCircle,
    iconColor: "text-red-500",
    bgAccent: "border-r-4 border-red-500",
    progressBar: "bg-red-500",
    title: "خطأ",
  },
  success: {
    icon: CheckCircle2,
    iconColor: "text-emerald-500",
    bgAccent: "border-r-4 border-emerald-500",
    progressBar: "bg-emerald-500",
    title: "تم بنجاح",
  },
  warning: {
    icon: AlertTriangle,
    iconColor: "text-amber-500",
    bgAccent: "border-r-4 border-amber-500",
    progressBar: "bg-amber-500",
    title: "تنبيه",
  },
  info: {
    icon: Info,
    iconColor: "text-[#123340]",
    bgAccent: "border-r-4 border-[#123340]",
    progressBar: "bg-[#123340]",
    title: "معلومة",
  },
};

export default function ToastItem({ toast, onDismiss }) {
  const { id, type = "info", message, duration = 4000 } = toast;
  const config = CONFIGS[type] || CONFIGS.info;
  const Icon = config.icon;

  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const remainingTimeRef = useRef(duration);
  const startTimeRef = useRef(0);

  useEffect(() => {
    if (duration <= 0) return;

    let intervalId;
    if (!isPaused) {
      startTimeRef.current = Date.now();
      const step = 50;

      intervalId = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        const currentRemaining = Math.max(0, remainingTimeRef.current - elapsed);
        setProgress((currentRemaining / duration) * 100);

        if (currentRemaining <= 0) {
          clearInterval(intervalId);
          onDismiss(id);
        }
      }, step);
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [isPaused, duration, id, onDismiss]);

  const handleMouseEnter = () => {
    setIsPaused(true);
    const elapsed = Date.now() - startTimeRef.current;
    remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  return (
    <div
      role="alert"
      dir="rtl"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`pointer-events-auto relative w-full overflow-hidden rounded-xl bg-white shadow-xl border border-gray-100 ${config.bgAccent} transition-all duration-300 transform translate-y-0`}
    >
      <div className="flex items-start gap-3 p-4">
        <Icon className={`w-5 h-5 ${config.iconColor} shrink-0 mt-0.5`} />

        <div className="flex-1 min-w-0 text-right">
          <p className="text-xs font-bold text-gray-400 mb-0.5">{config.title}</p>
          <p className="text-sm font-semibold text-gray-800 leading-snug break-words">
            {message}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onDismiss(id)}
          aria-label="إغلاق"
          className="text-gray-400 hover:text-gray-600 transition-colors p-1 -mr-1 -mt-1 cursor-pointer shrink-0 rounded-lg hover:bg-gray-100"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100">
          <div
            className={`h-full ${config.progressBar} transition-all duration-75`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

