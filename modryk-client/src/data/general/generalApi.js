/**
 * General & Master Data API Service
 * Implements endpoints specified in Section 3 of Modrek API Documentation
 */

import apiClient from "../apiClient";

export const generalApi = {
  /**
   * GET /general/get-farm_types
   * Livestock breeds (Nuaimi, Harri, Najdi, Sawakni...)
   */
  async getFarmTypes() {
    const response = await apiClient.get("/general/get-farm_types");
    return response.data || [];
  },

  /**
   * GET /general/get-farm-weights
   * Weight brackets (Small 20-25kg, Medium 26-30kg...)
   */
  async getFarmWeights() {
    const response = await apiClient.get("/general/get-farm-weights");
    return response.data || [];
  },

  /**
   * GET /general/get-delivery-methods
   * Delivery types (Refrigerated Van, Farm Pickup...)
   */
  async getDeliveryMethods() {
    const response = await apiClient.get("/general/get-delivery-methods");
    return response.data || [];
  },

  /**
   * GET /general/get-delivery-times
   * Delivery time slots (08:00 AM - 12:00 PM...)
   */
  async getDeliveryTimes() {
    const response = await apiClient.get("/general/get-delivery-times");
    return response.data || [];
  },

  /**
   * GET /general/get-cutting-types
   * Meat cutting styles (Quarters, Halves, Small pieces, Whole...)
   */
  async getCuttingTypes() {
    const response = await apiClient.get("/general/get-cutting-types");
    return response.data || [];
  },

  /**
   * GET /general/get-preparation-types
   * Packaging/preparation (Vacuum sealed, Trays, Bags...)
   */
  async getPreparationTypes() {
    const response = await apiClient.get("/general/get-preparation-types");
    return response.data || [];
  },

  /**
   * GET /general/get-payment-methods
   * Payment types (Mada, Visa, Apple Pay, Cash, Tamara...)
   */
  async getPaymentMethods() {
    const response = await apiClient.get("/general/get-payment-methods");
    return response.data || [];
  },

  /**
   * GET /general/get-order-status-types
   * Order stages (Pending, Slaughtering, Cutting, Quality Checked, Out for Delivery, Delivered)
   */
  async getOrderStatusTypes() {
    const response = await apiClient.get("/general/get-order-status-types");
    return response.data || [];
  },

  /**
   * GET /general/get-countries
   * Supported countries
   */
  async getCountries() {
    const response = await apiClient.get("/general/get-countries");
    return response.data || [];
  },

  /**
   * GET /general/get-regions?country_id={id}
   * Regions of country
   */
  async getRegions(countryId) {
    const params = countryId ? { country_id: countryId } : {};
    const response = await apiClient.get("/general/get-regions", { params });
    return response.data || [];
  },

  /**
   * GET /general/get-cities?region_id={id}
   * Cities of region
   */
  async getCities(regionId) {
    const params = regionId ? { region_id: regionId } : {};
    const response = await apiClient.get("/general/get-cities", { params });
    return response.data || [];
  },

  /**
   * GET /general/get-settings
   * App settings (contact numbers, working hours, terms, about us...)
   */
  async getSettings() {
    const response = await apiClient.get("/general/get-settings");
    return response.data || {};
  },
};

export default generalApi;

