import { useCallback, useEffect, useMemo, useState } from "react";
import { LoaderContext } from "./LoaderContext";
import GlobalLoader from "./GlobalLoader";

export default function LoaderProvider({ children }) {
  const [activeRequests, setActiveRequests] = useState(0);
  const [loadingText, setLoadingText] = useState("جاري التحميل...");

  const showLoader = useCallback((text) => {
    if (text) setLoadingText(text);
    setActiveRequests((prev) => prev + 1);
  }, []);

  const hideLoader = useCallback(() => {
    setActiveRequests((prev) => Math.max(0, prev - 1));
  }, []);

  const resetLoader = useCallback(() => {
    setActiveRequests(0);
  }, []);

  // Listen to global "app:loader:show" and "app:loader:hide" events
  useEffect(() => {
    const handleShow = (e) => {
      showLoader(e.detail?.text);
    };

    const handleHide = () => {
      hideLoader();
    };

    window.addEventListener("app:loader:show", handleShow);
    window.addEventListener("app:loader:hide", handleHide);

    return () => {
      window.removeEventListener("app:loader:show", handleShow);
      window.removeEventListener("app:loader:hide", handleHide);
    };
  }, [showLoader, hideLoader]);

  const contextValue = useMemo(
    () => ({
      isLoading: activeRequests > 0,
      showLoader,
      hideLoader,
      resetLoader,
      loadingText,
    }),
    [activeRequests, showLoader, hideLoader, resetLoader, loadingText],
  );

  return (
    <LoaderContext.Provider value={contextValue}>
      {children}
      {activeRequests > 0 && <GlobalLoader text={loadingText} />}
    </LoaderContext.Provider>
  );
}

