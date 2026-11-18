/**
 * Customer Orders & Tracking Redux Slice
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import ordersApi from "./ordersApi";

// --- Async Thunks ---

export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await ordersApi.getOrders(params);
    } catch (err) {
      return rejectWithValue(err.message || "فشل تحميل قائمة الطلبات");
    }
  },
);

export const fetchOrderDetails = createAsyncThunk(
  "orders/fetchOrderDetails",
  async (arg, { rejectWithValue }) => {
    try {
      const orderId =
        typeof arg === "object" && arg !== null ? arg.orderId : arg;
      const isSilent =
        typeof arg === "object" && arg !== null
          ? Boolean(arg.silent || arg.isPolling)
          : false;

      return await ordersApi.getOrderDetails(
        orderId,
        isSilent ? { skipToast: true } : {},
      );
    } catch (err) {
      return rejectWithValue(err.message || "فشل تحميل تفاصيل وتتبع الطلب");
    }
  },
);

export const retryOrderPayment = createAsyncThunk(
  "orders/retryOrderPayment",
  async (orderId, { rejectWithValue }) => {
    try {
      return await ordersApi.startPayment(orderId);
    } catch (err) {
      return rejectWithValue(err.message || "فشل بدء بوابة الدفع الإلكتروني");
    }
  },
);

export const submitOrderRating = createAsyncThunk(
  "orders/submitOrderRating",
  async (ratingPayload, { rejectWithValue }) => {
    try {
      return await ordersApi.rateOrder(ratingPayload);
    } catch (err) {
      return rejectWithValue(err.message || "فشل إرسال تقييم الطلب");
    }
  },
);

// --- Initial State ---
const initialState = {
  orders: [],
  currentOrder: null,
  pagination: {
    currentPage: 1,
    lastPage: 1,
    perPage: 10,
    total: 0,
    hasMorePages: false,
  },
  loading: false,
  detailsLoading: false,
  ratingSubmitting: false,
  error: null,
};

// --- Slice ---
export const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    clearOrdersError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // List Orders
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.items;
        state.pagination = {
          currentPage: action.payload.currentPage,
          lastPage: action.payload.lastPage,
          perPage: action.payload.perPage,
          total: action.payload.total,
          hasMorePages: action.payload.hasMorePages,
        };
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Single Order Details
    builder
      .addCase(fetchOrderDetails.pending, (state, action) => {
        const isSilent = Boolean(
          action.meta?.arg?.silent || action.meta?.arg?.isPolling,
        );
        if (!isSilent) {
          state.detailsLoading = true;
          state.error = null;
        }
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.currentOrder = action.payload;
        state.error = null;
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        const isSilent = Boolean(
          action.meta?.arg?.silent || action.meta?.arg?.isPolling,
        );
        if (!isSilent || !state.currentOrder) {
          state.error = action.payload;
        }
      });

    // Rating
    builder
      .addCase(submitOrderRating.pending, (state) => {
        state.ratingSubmitting = true;
      })
      .addCase(submitOrderRating.fulfilled, (state) => {
        state.ratingSubmitting = false;
      })
      .addCase(submitOrderRating.rejected, (state) => {
        state.ratingSubmitting = false;
      });
  },
});

export const { clearCurrentOrder, clearOrdersError } = ordersSlice.actions;

// --- Selectors ---
export const selectOrders = (state) => state.orders.orders;
export const selectCurrentOrder = (state) => state.orders.currentOrder;
export const selectOrdersPagination = (state) => state.orders.pagination;
export const selectOrdersLoading = (state) => state.orders.loading;
export const selectOrderDetailsLoading = (state) => state.orders.detailsLoading;
export const selectRatingSubmitting = (state) => state.orders.ratingSubmitting;
export const selectOrdersError = (state) => state.orders.error;

export default ordersSlice.reducer;

