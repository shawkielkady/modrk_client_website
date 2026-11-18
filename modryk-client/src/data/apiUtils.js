/**
 * API Utilities & Normalizers
 */

/**
 * Normalizes Saudi mobile numbers into separate dial_code and phone parts.
 * Example inputs: "0501234567", "+966501234567", "501234567"
 * Output: { dial_code: "+966", phone: "501234567" }
 */
export function parseSaudiPhone(rawPhone = "") {
  let cleaned = String(rawPhone || "").trim().replace(/\s+/g, "");

  let dialCode = "+966";

  if (cleaned.startsWith("+966")) {
    cleaned = cleaned.substring(4);
  } else if (cleaned.startsWith("00966")) {
    cleaned = cleaned.substring(5);
  } else if (cleaned.startsWith("966")) {
    cleaned = cleaned.substring(3);
  }

  // Remove leading 0 if present (e.g. 0501234567 -> 501234567)
  if (cleaned.startsWith("0")) {
    cleaned = cleaned.substring(1);
  }

  return {
    dial_code: dialCode,
    phone: cleaned,
  };
}

/**
 * Extracts a normalized, human-readable error message from Axios errors or API responses.
 */
export function extractErrorMessage(error, fallback = "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.") {
  if (!error) return fallback;

  if (typeof error === "string") return error;

  const response = error.response;

  // Server responded with an envelope (BaseResponse)
  if (response?.data) {
    const data = response.data;

    // 1. Single message
    if (typeof data.message === "string" && data.message.trim()) {
      // If there are validation errors, append the first one if message is generic
      if (data.errors && typeof data.errors === "object") {
        const firstKey = Object.keys(data.errors)[0];
        const val = data.errors[firstKey];
        if (Array.isArray(val) && val.length > 0) {
          return `${data.message}: ${val[0]}`;
        }
        if (typeof val === "string") {
          return `${data.message}: ${val}`;
        }
      }
      return data.message;
    }

    // 2. Direct errors map (e.g. Laravel validation 422)
    if (data.errors && typeof data.errors === "object") {
      const firstKey = Object.keys(data.errors)[0];
      const val = data.errors[firstKey];
      if (Array.isArray(val) && val.length > 0) {
        return val[0];
      }
      if (typeof val === "string") {
        return val;
      }
    }

    if (typeof data.error === "string") {
      return data.error;
    }
  }

  // Network or timeout errors
  if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
    return "انتهت مهلة الاتصال بالسيرفر. يرجى التحقق من اتصال الإنترنت والمحاولة ثانية.";
  }

  if (error.message === "Network Error" || !error.response) {
    return "تعذر الاتصال بالسيرفر. يرجى التأكد من اتصال الإنترنت.";
  }

  return error.message || fallback;
}

