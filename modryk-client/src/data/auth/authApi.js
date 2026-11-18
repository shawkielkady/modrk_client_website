/**
 * Customer Authentication & Profile API Service
 * Implements endpoints specified in Section 2 of Modrek API Documentation
 */

import apiClient from "../apiClient";
import {
  createUserModel,
  createLoginPayload,
  createRegisterPayload,
  createOtpPayload,
  createChangePasswordPayload,
} from "./authModels";
import { parseSaudiPhone } from "../apiUtils";

export const authApi = {
  /**
   * 2.1 Customer Login
   * POST /auth/customer/login
   */
  async login(credentials) {
    const payload = createLoginPayload(credentials);
    const response = await apiClient.post("/auth/customer/login", payload);
    const data = response.data || {};
    return {
      token: data.token || null,
      user: createUserModel(data.user),
      rawPhone: payload.phone,
      dialCode: payload.dial_code,
    };
  },

  /**
   * 2.2 Customer Register
   * POST /auth/customer/register
   */
  async register(data) {
    const payload = createRegisterPayload(data);
    const response = await apiClient.post("/auth/customer/register", payload);
    const resData = response.data || {};
    return {
      token: resData.token || null,
      user: createUserModel(resData.user),
      isVerified: Boolean(resData.user?.is_verified),
      rawPhone: payload.phone,
      dialCode: payload.dial_code,
      message: response.message,
    };
  },

  /**
   * 2.3 Verify Phone OTP
   * POST /auth/customer/verify
   */
  async verifyOtp(data) {
    const payload = createOtpPayload(data);
    const response = await apiClient.post("/auth/customer/verify", payload);
    const resData = response.data || {};
    return {
      token: resData.token || null,
      user: createUserModel(resData.user),
      isVerified: Boolean(resData.user?.is_verified),
    };
  },

  /**
   * 2.4 Resend OTP Code
   * POST /auth/customer/resend-code
   */
  async resendCode(phoneInput) {
    const parsed = parseSaudiPhone(phoneInput);
    const response = await apiClient.post("/auth/customer/resend-code", {
      dial_code: parsed.dial_code,
      phone: parsed.phone,
    });
    return response;
  },

  /**
   * 2.5 Forgot Password (Request Reset OTP)
   * POST /auth/customer/forget-password
   */
  async forgotPassword(phoneInput) {
    const parsed = parseSaudiPhone(phoneInput);
    const response = await apiClient.post("/auth/customer/forget-password", {
      dial_code: parsed.dial_code,
      phone: parsed.phone,
    });
    return response;
  },

  /**
   * 2.6 Reset Password
   * POST /auth/customer/reset-password
   */
  async resetPassword({ new_password, new_password_confirmation }) {
    const response = await apiClient.post("/auth/customer/reset-password", {
      new_password,
      new_password_confirmation,
    });
    return response;
  },

  /**
   * 2.7 Change Password (In-App)
   * POST /auth/customer/change-password
   */
  async changePassword(passwords) {
    const payload = createChangePasswordPayload(passwords);
    const response = await apiClient.post("/auth/customer/change-password", payload);
    return response;
  },

  /**
   * 2.8 Get Current Authenticated Profile
   * GET /auth/customer/me
   */
  async getProfile() {
    const response = await apiClient.get("/auth/customer/me");
    const resData = response.data || {};
    return createUserModel(resData.user || resData);
  },

  /**
   * 2.9 Edit Profile
   * POST /auth/customer/edit-profile
   */
  async editProfile(data = {}) {
    const payload = {};
    if (data.name !== undefined) payload.name = String(data.name || "").trim();
    if (data.email !== undefined) payload.email = String(data.email || "").trim();

    const response = await apiClient.post("/auth/customer/edit-profile", payload);
    const rawUser =
      response?.user ||
      response?.data?.user ||
      response?.data ||
      response;
    const role = response?.role || rawUser?.role || "customer";

    return createUserModel({
      ...rawUser,
      role,
    });
  },

  /**
   * 2.10 Update Push Notification Device Token
   * POST /auth/device-token
   */
  async updateDeviceToken(deviceId) {
    return await apiClient.post("/auth/device-token", { device_id: deviceId });
  },

  /**
   * 2.11 Logout
   * POST /auth/customer/logout
   */
  async logout() {
    try {
      await apiClient.post("/auth/customer/logout");
    } catch {
      // Local token cleanup proceeds even if server fails
    }
  },
};

export default authApi;
