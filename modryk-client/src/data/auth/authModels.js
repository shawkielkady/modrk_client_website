/**
 * Auth Data Models & Factories according to Modrek API specifications
 */

import { parseSaudiPhone } from "../apiUtils";

/**
 * Normalizes user entity from backend
 */
export function createUserModel(raw = {}) {
  if (!raw) return null;
  return {
    id: raw.id || raw._id || null,
    name: raw.name || "",
    email: raw.email || "",
    phone: raw.phone || "",
    dial_code: raw.dial_code || raw.dialCode || "+966",
    dialCode: raw.dial_code || raw.dialCode || "+966",
    role: raw.role || null,
    image: raw.image || raw.avatar || "",
    deviceId: raw.device_id || null,
    isVerified: Boolean(raw.is_verified),
    createdAt: raw.created_at || raw.createdAt || null,
    ...raw,
  };
}

/**
 * Formats Customer Login payload
 * Supports phone string (e.g. "0501234567") or object with dial_code + phone
 */
export function createLoginPayload({ username, phone, dial_code, password }) {
  const phoneInput = phone || username || "";
  const parsed = parseSaudiPhone(phoneInput);

  return {
    dial_code: dial_code || parsed.dial_code,
    phone: parsed.phone,
    password: String(password || ""),
  };
}

/**
 * Formats Customer Register payload
 */
export function createRegisterPayload({
  name = "",
  email = "",
  phone = "",
  dial_code,
  password = "",
  confirmPassword = "",
  password_confirmation = "",
}) {
  const parsed = parseSaudiPhone(phone);

  return {
    name: String(name || "").trim(),
    email: String(email || "").trim(),
    dial_code: dial_code || parsed.dial_code,
    phone: parsed.phone,
    password: String(password || ""),
    password_confirmation: String(
      password_confirmation || confirmPassword || password || "",
    ),
  };
}

/**
 * Formats Phone OTP verification payload
 */
export function createOtpPayload({
  phone = "",
  dial_code,
  otp_code = "",
  code = "",
}) {
  const parsed = parseSaudiPhone(phone);

  return {
    dial_code: dial_code || parsed.dial_code,
    phone: parsed.phone,
    otp_code: String(otp_code || code || "").trim(),
  };
}

/**
 * Formats In-App Change Password payload
 */
export function createChangePasswordPayload({
  old_password = "",
  oldPassword = "",
  new_password = "",
  newPassword = "",
  confirmNewPassword = "",
  new_password_confirmation = "",
}) {
  const newPass = new_password || newPassword || "";
  const confirmPass =
    new_password_confirmation || confirmNewPassword || newPass;

  return {
    old_password: String(old_password || oldPassword || ""),
    new_password: String(newPass),
    new_password_confirmation: String(confirmPass),
  };
}

/**
 * Token Storage Helpers
 */
export const TokenStorage = {
  get: () => {
    try {
      return localStorage.getItem("token") || null;
    } catch {
      return null;
    }
  },
  set: (token) => {
    try {
      if (token) {
        localStorage.setItem("token", token);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("storage"));
        }
      }
    } catch {
      // ignore
    }
  },
  remove: () => {
    try {
      localStorage.removeItem("token");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("storage"));
      }
    } catch {
      // ignore
    }
  },
};

/**
 * User Storage Helpers
 */
export const UserStorage = {
  get: () => {
    try {
      const u = localStorage.getItem("user");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },
  set: (user) => {
    try {
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("storage"));
        }
      }
    } catch {
      // ignore
    }
  },
  remove: () => {
    try {
      localStorage.removeItem("user");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("storage"));
      }
    } catch {
      // ignore
    }
  },
};
