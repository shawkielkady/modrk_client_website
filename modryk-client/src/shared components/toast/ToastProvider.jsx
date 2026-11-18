import { useCallback, useEffect, useMemo, useState } from "react";
import { ToastContext } from "./ToastContext";
import ToastItem from "./ToastItem";

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toastData) => {
    const id = toastData.id || Date.now() + Math.random();
    setToasts((prev) => {
      // Avoid duplicate exact messages within 1 second
      if (prev.some((t) => t.message === toastData.message && Date.now() - t.id < 1500)) {
        return prev;
      }
      return [...prev, { ...toastData, id }];
    });
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Listen to global "app:toast" events dispatched anywhere in the app
  useEffect(() => {
    const handleGlobalToast = (event) => {
      if (event.detail) {
        addToast(event.detail);
      }
    };

    window.addEventListener("app:toast", handleGlobalToast);
    return () => {
      window.removeEventListener("app:toast", handleGlobalToast);
    };
  }, [addToast]);

  const contextValue = useMemo(
    () => ({
      showToast: (message, type, duration) => addToast({ message, type, duration }),
      showError: (message, duration) => addToast({ message, type: "error", duration }),
      showSuccess: (message, duration) => addToast({ message, type: "success", duration }),
      showWarning: (message, duration) => addToast({ message, type: "warning", duration }),
      showInfo: (message, duration) => addToast({ message, type: "info", duration }),
      removeToast,
    }),
    [addToast, removeToast],
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      {/* Floating Toast Notification Container */}
      <div
        aria-live="polite"
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-md px-4 flex flex-col gap-2.5 pointer-events-none"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

