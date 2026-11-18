/**
 * Customer Orders & Tracking API Service
 * Implements endpoints specified in Section 6 of Modrek API Documentation
 */

import apiClient from "../apiClient";

export const ordersApi = {
  /**
   * 6.1 Get Customer Orders (Paginated)
   * GET /customer/get-orders?page=
   */
  async getOrders(params = {}) {
    const page = Number(params.page || 1);
    const perPage = Number(params.per_page || 10);

    const query = {
      page,
      per_page: perPage,
      ...params,
    };

    const response = await apiClient.get("/customer/get-orders", {
      params: query,
    });
    const resData = response?.data !== undefined ? response.data : response || {};

    const items = Array.isArray(resData)
      ? resData
      : Array.isArray(resData?.items)
        ? resData.items
        : Array.isArray(resData?.orders)
          ? resData.orders
          : Array.isArray(resData?.data)
            ? resData.data
            : [];

    const meta = resData?.meta || resData?.pagination || resData || {};
    const currentPage = Number(meta?.current_page ?? resData?.current_page ?? query.page ?? 1);
    const lastPage = Number(meta?.last_page ?? resData?.last_page ?? 1);
    const total = Number(meta?.total ?? resData?.total ?? items.length);
    const resolvedPerPage = Number(meta?.per_page ?? resData?.per_page ?? query.per_page ?? 10);
    const hasMorePages = Boolean(
      resData?.has_more_pages !== undefined
        ? resData.has_more_pages
        : currentPage < lastPage,
    );

    return {
      items,
      currentPage,
      lastPage,
      perPage: resolvedPerPage,
      total,
      hasMorePages,
    };
  },

  /**
   * 6.2 Get Single Order Details & Tracking
   * GET /customer/get-order?order_id=
   */
  async getOrderDetails(orderId, options = {}) {
    const response = await apiClient.get("/customer/get-order", {
      params: { order_id: orderId },
      ...options,
    });
    return response?.data !== undefined ? response.data : response || {};
  },

  /**
   * 6.3 Start / Retry Order Payment
   * POST /customer/start-payment
   */
  async startPayment(orderId) {
    const response = await apiClient.post("/customer/start-payment", {
      order_id: orderId,
    });
    return response.data || {};
  },

  /**
   * 6.4 Rate Completed Order
   * POST /customer/rate-order
   */
  async rateOrder(params = {}) {
    const order_id = params.order_id ?? params.orderId;
    const farm_rating = params.farm_rating ?? params.farmRating ?? 5;
    const service_rating = params.service_rating ?? params.serviceRating ?? 5;
    const farm_review = params.farm_review ?? params.farmReview ?? "";
    const service_review = params.service_review ?? params.serviceReview ?? "";

    const payload = {
      order_id: Number(order_id),
      farm_rating: Number(farm_rating),
      service_rating: Number(service_rating),
      farm_review: String(farm_review || ""),
      service_review: String(service_review || ""),
    };

    // Send both in body and query params to satisfy any backend parameter handling
    const response = await apiClient.post("/customer/rate-order", payload, {
      params: payload,
    });
    return response.data || {};
  },
};

export default ordersApi;
