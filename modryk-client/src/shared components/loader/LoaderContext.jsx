import { createContext, useContext } from "react";

export const LoaderContext = createContext(null);

export function useLoader() {
  const ctx = useContext(LoaderContext);
  if (!ctx) {
    throw new Error("useLoader must be used within a <LoaderProvider>");
  }
  return ctx;
}

/**
 * Global loader helper that can be called anywhere,
 * including inside API interceptors, thunks, or outside React tree.
 */
export const loader = {
  show: (text = "جاري التحميل...") => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("app:loader:show", { detail: { text } }),
      );
    }
  },
  hide: () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("app:loader:hide"));
    }
  },
};

export default loader;

