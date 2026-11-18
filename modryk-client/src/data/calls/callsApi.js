/**
 * Live Video Calls & Selection API Service
 * Implements endpoints specified in Section 8 of Modrek API Documentation
 */

import apiClient from "../apiClient";

export const callsApi = {
  /**
   * 8.1.1 Start Call
   * POST /calls/start-call
   */
  async startCall({ farm_id, num_of_sheeps = 1 }) {
    const response = await apiClient.post("/calls/start-call", {
      farm_id,
      num_of_sheeps,
    });
    return response.data || {};
  },

  /**
   * 8.1.5 End Call
   * POST /calls/end-call
   */
  async endCall(call_id) {
    const response = await apiClient.post("/calls/end-call", {
      call_id,
    });
    return response.data || {};
  },

  /**
   * 8.1.6 Call Heartbeat
   * POST /calls/heartbeat
   */
  async heartbeat(call_id) {
    const response = await apiClient.post("/calls/heartbeat", {
      call_id,
    });
    return response.data || {};
  },

  /**
   * 8.2.1 Instant Turn Reservation (Queue)
   * POST /calls/reserve-call
   */
  async reserveCall({ farm_id, num_of_sheeps = 1 }) {
    const response = await apiClient.post("/calls/reserve-call", {
      farm_id,
      num_of_sheeps,
    });
    return response.data || {};
  },

  /**
   * 8.2.2 Scheduled Call
   * POST /calls/schedule_call
   */
  async scheduleCall({ farm_id, schedule_time, num_of_sheeps = 1 }) {
    const response = await apiClient.post("/calls/schedule_call", {
      farm_id,
      schedule_time,
      num_of_sheeps,
    });
    return response.data || {};
  },

  /**
   * 8.2.3 Cancel Reservation
   * POST /calls/cancel-reserved-call
   */
  async cancelReservedCall(call_id) {
    const response = await apiClient.post("/calls/cancel-reserved-call", null, {
      params: { call_id },
    });
    return response.data || {};
  },
};

export default callsApi;

