/**
 * Farms & Livestock API Service
 * Implements endpoints specified in Section 4 of Modrek API Documentation
 */

import apiClient from "../apiClient";

export const farmsApi = {
  /**
   * 4.1 List Farms
   * GET /farms?page=&farm_type_id=&farm_weight_id=
   */
  async getFarms(params = {}) {
    const query = {};
    if (params.page) query.page = params.page;
    if (params.farmTypeId) query.farm_type_id = params.farmTypeId;
    if (params.farm_weight_id) query.farm_weight_id = params.farm_weight_id;
    console.log("this client query", query);
    const response = await apiClient.get("/farms", { params: query });
    const data = response.data || {};
    console.log("this client data", data);
    return {
      items: data.items || (Array.isArray(data) ? data : []),
      currentPage: data.current_page || 1,
      lastPage: data.last_page || 1,
      hasMorePages: Boolean(data.has_more_pages),
    };
  },

  /**
   * 4.2 Get Farm Details & Sheep Inventory
   * GET /farms/{id}?farm_type_id=
   */
  async getFarmDetails(id, params = {}) {
    const query = {};
    if (params.farm_type_id) query.farm_type_id = params.farm_type_id;

    const response = await apiClient.get(`/farms/${id}`, { params: query });
    return response.data || {};
  },

  /**
   * 4.3 Get Farm Ratings & Reviews
   * GET /farms/{id}/ratings?page=
   */
  async getFarmRatings(id, params = {}) {
    const query = {};
    if (params.page) query.page = params.page;

    const response = await apiClient.get(`/farms/${id}/ratings`, {
      params: query,
    });
    const data = response.data || {};
    return {
      items: data.items || (Array.isArray(data) ? data : []),
      currentPage: data.current_page || 1,
      lastPage: data.last_page || 1,
      hasMorePages: Boolean(data.has_more_pages),
    };
  },
};

export default farmsApi;
