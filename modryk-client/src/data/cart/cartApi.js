/**
 * Customer Cart & Checkout API Service
 * Implements endpoints specified in Section 5 of Modrek API Documentation
 */

import apiClient from "../apiClient";

export const cartApi = {
  /**
   * 5.1 Get Current Active Cart
   * GET /customer/get-cart
   */
  async getCart() {
    const response = await apiClient.get("/customer/get-cart");
    return response.data || null;
  },

  /**
   * 5.2 Add to Cart
   * POST /customer/add-to-cart
   */
  async addToCart({ farm_id, num_of_sheeps = 1, sale_type = "individual" }) {
    const response = await apiClient.post(
      "/customer/add-to-cart",
      {
        farm_id,
        num_of_sheeps,
        sale_type,
      },
      { skipToast: true },
    );
    return response.data || {};
  },

  /**
   * 5.3 Apply Discount Coupon
   * POST /customer/add-coupon-to-cart
   */
  async applyCoupon(coupon_code) {
    const response = await apiClient.post("/customer/add-coupon-to-cart", {
      coupon_code: String(coupon_code || "").trim(),
    });
    return response.data || {};
  },

  /**
   * 5.4 Remove Discount Coupon
   * POST /customer/delete-coupon-from-cart
   */
  async removeCoupon() {
    const response = await apiClient.post(
      "/customer/delete-coupon-from-cart",
      {},
    );
    return response.data || {};
  },

  /**
   * 5.5 Clear / Delete Cart
   * POST /customer/delete-cart
   */
  async deleteCart() {
    const response = await apiClient.post("/customer/delete-cart", {});
    return response.data || {};
  },

  /**
   * 5.6 Dynamic Cart Calculations
   * POST /customer/get-cart-calculations
   */
  async getCartCalculations(payload) {
    console.log("[get-cart-calculations] Sending payload:", payload);
    const response = await apiClient.post(
      "/customer/get-cart-calculations",
      payload,
    );
    console.log("[get-cart-calculations] Response:", response.data);
    return response.data || {};
  },

  /**
   * 5.7 Submit Cart & Place Order (Checkout)
   * POST /customer/submit-cart
   */
  async submitCart(payload) {
    const response = await apiClient.post("/customer/submit-cart", payload);
    return response.data || response || {};
  },
};

export default cartApi;
