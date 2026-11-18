/**
 * Centralized Axios API Client
 * Provides dynamic localization, Bearer token injection, multipart handling,
 * and unified response/error normalization according to Modrek API specifications.
 */

import axios from "axios";
import i18n from "../i18n";
import { extractErrorMessage } from "./apiUtils";

// Base host without locale prefix (locale is dynamically injected per request)
const API_HOST = (import.meta.env.VITE_API_URL || "https://modrk.modrk-app.com").replace(/\/+$/, "");

export const apiClient = axios.create({
  timeout: 60000, // 60 seconds for uploads and payment operations
  headers: {
    Accept: "application/json",
  },
});

/**
 * Request Interceptor:
 * - Dynamically determines current locale (ar / en)
 * - Sets baseURL: https://modrk.modrk-app.com/api/{locale}
 * - Appends ?lang={locale} query parameter
 * - Attaches Accept-Language header
 * - Attaches Authorization: Bearer <token> if token exists in localStorage
 * - Automatically handles FormData without overwriting boundary
 */
apiClient.interceptors.request.use(
  (config) => {
    // Show global loader if explicitly requested
    if (config.showLoader && typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("app:loader:show", {
          detail: { text: config.loadingText || "جاري المعالجة..." },
        }),
      );
    }

    const locale = (i18n.resolvedLanguage || i18n.language || "ar").split("-")[0];

    // Set dynamic locale-prefixed baseURL
    config.baseURL = `${API_HOST}/api/${locale}`;

    // Ensure lang query parameter is always passed
    config.params = {
      lang: locale,
      ...config.params,
    };

    config.headers["Accept-Language"] = locale;

    // Attach Authorization Bearer token if present
    const token = localStorage.getItem("token");
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Support FormData uploads: let the browser generate boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else if (!config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => {
    if (error.config?.showLoader && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("app:loader:hide"));
    }
    return Promise.reject(error);
  },
);

/**
 * Response Interceptor:
 * - Unwraps BaseResponse: returns server payload { message, errors, data }
 * - On 401 Unauthorized: clears invalid token and dispatches auth:unauthorized event
 * - Normalizes server errors for clean consumption by async thunks
 * - Emits global error toast on failure
 */
apiClient.interceptors.response.use(
  (response) => {
    if (response.config?.showLoader && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("app:loader:hide"));
    }
    // Returns server JSON payload directly
    return response.data;
  },
  (error) => {
    if (error.config?.showLoader && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("app:loader:hide"));
    }

    const status = error.response?.status;

    // Handle 401 Unauthorized: token expired or invalid
    if (status === 401) {
      localStorage.removeItem("token");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      }
    }

    const message = extractErrorMessage(error);

    // Automatically emit global error toast unless explicitly skipped (e.g. skipToast: true)
    if (!error.config?.skipToast && typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("app:toast", {
          detail: {
            type: "error",
            message,
            duration: 4500,
          },
        }),
      );
    }

    // Create a normalized error object
    const normalizedError = new Error(message);
    normalizedError.status = status;
    normalizedError.errors = error.response?.data?.errors || null;
    normalizedError.data = error.response?.data || null;
    normalizedError.isAxiosError = true;

    return Promise.reject(normalizedError);
  },
);

export default apiClient;
