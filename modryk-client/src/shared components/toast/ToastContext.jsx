import { createContext, useContext } from "react";

export const ToastContext = createContext(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a <ToastProvider>");
  }
  return ctx;
}

/**
 * Global toast helper that can be called anywhere,
 * including inside API interceptors, thunks, or outside React tree.
 */
export const toast = {
  show: (message, type = "info", duration = 4000) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("app:toast", {
          detail: { message, type, duration, id: Date.now() + Math.random() },
        }),
      );
    }
  },
  error: (message, duration = 4500) => {
    toast.show(message, "error", duration);
  },
  success: (message, duration = 3500) => {
    toast.show(message, "success", duration);
  },
  warning: (message, duration = 4000) => {
    toast.show(message, "warning", duration);
  },
  info: (message, duration = 3500) => {
    toast.show(message, "info", duration);
  },
};

export default toast;

