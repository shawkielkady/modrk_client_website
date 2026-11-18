/**
 * Customer Addresses API Service
 * Implements endpoints specified in Section 7 of Modrek API Documentation
 */

import apiClient from "../apiClient";

export const addressesApi = {
  /**
   * 7.1 List Addresses
   * GET /customer/get-addresses
   */
  async getAddresses() {
    const response = await apiClient.get("/customer/get-addresses");
    const data = response.data || {};
    return data.items || (Array.isArray(data) ? data : []);
  },

  /**
   * 7.2 Get Default Address
   * GET /customer/get-default-address
   */
  async getDefaultAddress() {
    const response = await apiClient.get("/customer/get-default-address");
    return response.data || null;
  },

  /**
   * 7.3 Add Address
   * POST /customer/add-address
   */
  async addAddress(payload) {
    const response = await apiClient.post("/customer/add-address", payload);
    return response.data || {};
  },

  /**
   * 7.4 Edit Address
   * POST /customer/edit-address
   */
  async editAddress(payload) {
    const response = await apiClient.post("/customer/edit-address", payload);
    return response.data || {};
  },
};

export default addressesApi;

