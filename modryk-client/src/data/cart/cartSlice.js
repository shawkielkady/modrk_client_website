/**
 * Customer Cart & Checkout Redux Slice
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import cartApi from "./cartApi";

// --- Async Thunks ---

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      return await cartApi.getCart();
    } catch (err) {
      return rejectWithValue(err.message || "فشل تحميل محتويات السلة");
    }
  },
);

export const addItemToCart = createAsyncThunk(
  "cart/addItemToCart",
  async (
    { farm_id, num_of_sheeps, sale_type = "individual" },
    { rejectWithValue, dispatch },
  ) => {
    try {
      const data = await cartApi.addToCart({
        farm_id,
        num_of_sheeps,
        sale_type,
      });
      dispatch(fetchCart());
      return data;
    } catch (err) {
      return rejectWithValue({
        message: err.message || "فشل إضافة الذبيحة إلى السلة",
        status: err.status ?? err.response?.status ?? null,
      });
    }
  },
);

export const applyCartCoupon = createAsyncThunk(
  "cart/applyCartCoupon",
  async (couponCode, { rejectWithValue, dispatch }) => {
    try {
      const data = await cartApi.applyCoupon(couponCode);
      dispatch(fetchCart());
      return { data, couponCode };
    } catch (err) {
      return rejectWithValue(
        err.message || "كوبون الخصم غير صالح أو منتهي الصلاحية",
      );
    }
  },
);

export const removeCartCoupon = createAsyncThunk(
  "cart/removeCartCoupon",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const data = await cartApi.removeCoupon();
      dispatch(fetchCart());
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "فشل إزالة كوبون الخصم");
    }
  },
);

export const clearActiveCart = createAsyncThunk(
  "cart/clearActiveCart",
  async (_, { rejectWithValue }) => {
    try {
      await cartApi.deleteCart();
      return null;
    } catch (err) {
      return rejectWithValue(err.message || "فشل تفريغ السلة");
    }
  },
);

const mapCartItemsToSheeps = (cartItems = [], existingSheeps = []) => {
  if (!Array.isArray(cartItems)) return [];
  return cartItems.map((item) => {
    const sheepId = item.sheep?.id ?? item.sheep_id ?? item.id;
    const prev = existingSheeps.find(
      (s) => String(s.sheep_id) === String(sheepId),
    );
    return {
      sheep_id: Number(sheepId),
      num_of_quarters: prev?.num_of_quarters ?? item.num_of_quarters ?? 4,
      cutting_type_id: prev?.cutting_type_id ?? item.cutting_type_id ?? 1,
      preparation_type_id:
        prev?.preparation_type_id ?? item.preparation_type_id ?? 1,
      want_head_feet: prev?.want_head_feet ?? Boolean(item.want_head_feet),
      want_stomach_intestines:
        prev?.want_stomach_intestines ?? Boolean(item.want_stomach_intestines),
      notes: prev?.notes ?? item.notes ?? "",
    };
  });
};

export const recalculateCart = createAsyncThunk(
  "cart/recalculateCart",
  async (customPayload, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const wrapper = state.cart?.submitCartDataWrapper || {};
      const cart = state.cart?.cart;

      const paymentMethodId =
        customPayload?.payment_method_id ??
        wrapper.payment_method_id ??
        state.cart?.selectedPaymentMethodId ??
        1;

      // recalculateCart depends ONLY on the sub_method ID
      const targetSubMethodId =
        customPayload?.delivery_sub_method_id ??
        wrapper.delivery_sub_method_id ??
        null;

      if (!targetSubMethodId) {
        return null;
      }

      let sourceSheeps = [];
      if (
        Array.isArray(customPayload?.sheeps) &&
        customPayload.sheeps.length > 0
      ) {
        sourceSheeps = customPayload.sheeps;
      } else if (Array.isArray(wrapper.sheeps) && wrapper.sheeps.length > 0) {
        sourceSheeps = wrapper.sheeps;
      } else if (
        Array.isArray(cart?.cart_items) &&
        cart.cart_items.length > 0
      ) {
        sourceSheeps = mapCartItemsToSheeps(cart.cart_items, wrapper.sheeps);
      }

      const defaultCuttingId = state.general?.cuttingTypes?.[0]?.id ?? 1;
      const defaultPrepId = state.general?.preparationTypes?.[0]?.id ?? 1;

      const formattedSheeps = sourceSheeps.map((s) => {
        const sheepId = s.sheep_id ?? s.sheep?.id ?? s.id;
        const cuttingId = s.cutting_type_id ?? defaultCuttingId;
        const prepId = s.preparation_type_id ?? defaultPrepId;

        return {
          sheep_id: Number(sheepId),
          cutting_type_id: Number(cuttingId),
          preparation_type_id: Number(prepId),
          want_head_feet: Boolean(s.want_head_feet),
          want_stomach_intestines: Boolean(s.want_stomach_intestines),
        };
      });

      const payload = {
        payment_method_id: Number(paymentMethodId),
        delivery_method_id: Number(targetSubMethodId),
        sheeps: formattedSheeps,
      };

      console.log("dispatching getCartCalculations payload:", payload);
      return await cartApi.getCartCalculations(payload);
    } catch (err) {
      return rejectWithValue(err.message || "فشل احتساب إجمالي السلة");
    }
  },
);

export const submitCheckout = createAsyncThunk(
  "cart/submitCheckout",
  async (customPayload, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const wrapper = customPayload || state.cart?.submitCartDataWrapper || {};
      const cart = state.cart?.cart;

      let sourceSheeps =
        Array.isArray(wrapper.sheeps) && wrapper.sheeps.length > 0
          ? wrapper.sheeps
          : [];

      if (
        sourceSheeps.length === 0 &&
        Array.isArray(cart?.cart_items) &&
        cart.cart_items.length > 0
      ) {
        sourceSheeps = mapCartItemsToSheeps(cart.cart_items, wrapper.sheeps);
      }

      const defaultCuttingId = state.general?.cuttingTypes?.[0]?.id ?? 1;
      const defaultPrepId = state.general?.preparationTypes?.[0]?.id ?? 1;

      const formattedSheeps = sourceSheeps.map((s) => {
        const sheepId = s.sheep_id ?? s.sheep?.id ?? s.id;
        const cuttingId = s.cutting_type_id ?? defaultCuttingId;
        const prepId = s.preparation_type_id ?? defaultPrepId;

        return {
          sheep_id: Number(sheepId),
          num_of_quarters: Number(s.num_of_quarters ?? 4),
          cutting_type_id: Number(cuttingId),
          preparation_type_id: Number(prepId),
          want_head_feet: Boolean(s.want_head_feet),
          want_stomach_intestines: Boolean(s.want_stomach_intestines),
          notes: String(s.notes || ""),
        };
      });

      const finalDeliveryMethodId =
        wrapper.delivery_sub_method_id ||
        wrapper.delivery_method_id ||
        state.cart?.selectedDeliveryMethodId ||
        1;

      const finalAddressId =
        wrapper.address_id || state.cart?.selectedAddressId;
      const finalPaymentMethodId =
        wrapper.payment_method_id || state.cart?.selectedPaymentMethodId || 1;
      const finalDeliveryDate =
        wrapper.delivery_date || state.cart?.deliveryDate || "";
      const finalDeliveryTimeId =
        wrapper.delivery_time_id || state.cart?.selectedDeliveryTimeId || null;
      const finalNotes =
        wrapper.notes !== undefined
          ? wrapper.notes
          : state.cart?.orderNotes || "";

      const returnUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/confirm-order?payment_status=success`
          : "";

      const payload = {
        address_id: Number(finalAddressId),
        payment_method_id: Number(finalPaymentMethodId),
        delivery_method_id: Number(finalDeliveryMethodId),
        delivery_date: String(finalDeliveryDate),
        ...(finalDeliveryTimeId ? { delivery_time_id: Number(finalDeliveryTimeId) } : {}),
        notes: String(finalNotes),
        sheeps: formattedSheeps,
        ...(returnUrl ? { callback_url: returnUrl, return_url: returnUrl } : {}),
      };

      console.log("Submitting order with payload:", payload);
      return await cartApi.submitCart(payload);
    } catch (err) {
      return rejectWithValue(err.message || "فشل إتمام وتأكيد الطلب");
    }
  },
);
const EMPTY_SUB_METHODS = [];

export const getCurrentSubMethod = (state, currentMethodId) => {
  const currentMethods = state.general?.deliveryMethods;
  if (!Array.isArray(currentMethods) || currentMethods.length === 0) {
    return EMPTY_SUB_METHODS;
  }

  const targetId = currentMethodId ?? currentMethods[0]?.id;
  const currentMethod = currentMethods.find(
    (element) => element.id === targetId,
  );

  return currentMethod?.sub_methods ?? EMPTY_SUB_METHODS;
};

const createInitialSubmitCartDataWrapper = () => ({
  address_id: null,
  payment_method_id: null,
  delivery_method_id: null,
  delivery_sub_method_id: null,
  delivery_date: "",
  delivery_time_id: null,
  coupon_code: "",
  notes: "",
  sheeps: [],
});

// --- Initial State ---
const initialState = {
  cart: null,
  calculations: null,
  submitCartDataWrapper: createInitialSubmitCartDataWrapper(),
  couponCode: "",
  couponApplied: false,
  couponError: null,
  selectedDeliveryMethodId: 1,
  selectedDeliveryTimeId: null,
  selectedPaymentMethodId: 1,
  selectedAddressId: null,
  currentSubMethods: null,
  deliveryDate: "",
  orderNotes: "",
  lastOrderResult: null,
  loading: false,
  addingToCart: false,
  clearingCart: false,
  calculating: false,
  submitting: false,
  error: null,
  addToCartError: null,
  clearingCartError: null,
  successMessage: null,
};

// --- Slice ---
export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    updateSubmitCartData: (state, action) => {
      state.submitCartDataWrapper = {
        ...state.submitCartDataWrapper,
        ...(action.payload || {}),
      };
    },
    updateSubmitCartSheep: (state, action) => {
      const { sheepId, applyToAll = true, changes = {} } = action.payload || {};
      state.submitCartDataWrapper.sheeps =
        state.submitCartDataWrapper.sheeps.map((sheep) => {
          if (applyToAll || String(sheep.sheep_id) === String(sheepId)) {
            return { ...sheep, ...changes };
          }
          return sheep;
        });
    },
    resetSubmitCartData: (state) => {
      state.submitCartDataWrapper = createInitialSubmitCartDataWrapper();
    },
    setSelectedDeliveryMethodId: (state, action) => {
      state.selectedDeliveryMethodId = action.payload;
      state.submitCartDataWrapper.delivery_method_id = action.payload;
    },
    setSelectedDeliveryTimeId: (state, action) => {
      state.selectedDeliveryTimeId = action.payload;
      state.submitCartDataWrapper.delivery_time_id = action.payload;
    },
    setSelectedPaymentMethodId: (state, action) => {
      state.selectedPaymentMethodId = action.payload;
      state.submitCartDataWrapper.payment_method_id = action.payload;
    },
    setSelectedAddressId: (state, action) => {
      state.selectedAddressId = action.payload;
      state.submitCartDataWrapper.address_id = action.payload;
    },
    setDeliveryDate: (state, action) => {
      state.deliveryDate = action.payload;
      state.submitCartDataWrapper.delivery_date = action.payload;
    },
    setOrderNotes: (state, action) => {
      state.orderNotes = action.payload;
      state.submitCartDataWrapper.notes = action.payload;
    },
    clearCartError: (state) => {
      state.error = null;
      state.couponError = null;
      state.addToCartError = null;
      state.clearingCartError = null;
    },
    clearLastOrderResult: (state) => {
      state.lastOrderResult = null;
    },
  },
  extraReducers: (builder) => {
    // Get Cart
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
        state.submitCartDataWrapper.sheeps = mapCartItemsToSheeps(
          action.payload?.cart_items,
          state.submitCartDataWrapper.sheeps,
        );
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Add Item to Cart
    builder
      .addCase(addItemToCart.pending, (state) => {
        state.addingToCart = true;
        state.addToCartError = null;
        state.error = null;
      })
      .addCase(addItemToCart.fulfilled, (state) => {
        state.addingToCart = false;
        state.addToCartError = null;
      })
      .addCase(addItemToCart.rejected, (state, action) => {
        state.addingToCart = false;
        const message =
          typeof action.payload === "string"
            ? action.payload
            : action.payload?.message || "فشل إضافة الذبيحة إلى السلة";
        state.addToCartError = message;
        state.error = message;
      });

    // Apply Coupon
    builder
      .addCase(applyCartCoupon.fulfilled, (state, action) => {
        state.couponCode = action.payload.couponCode;
        state.couponApplied = true;
        state.couponError = null;
        state.submitCartDataWrapper.coupon_code = action.payload.couponCode;
      })
      .addCase(applyCartCoupon.rejected, (state, action) => {
        state.couponError = action.payload;
      });

    // Remove Coupon
    builder.addCase(removeCartCoupon.fulfilled, (state) => {
      state.couponCode = "";
      state.couponApplied = false;
      state.couponError = null;
      state.submitCartDataWrapper.coupon_code = "";
    });

    // Clear Cart
    builder
      .addCase(clearActiveCart.pending, (state) => {
        state.clearingCart = true;
        state.clearingCartError = null;
        state.error = null;
      })
      .addCase(clearActiveCart.fulfilled, (state) => {
        state.clearingCart = false;
        state.clearingCartError = null;
        state.cart = null;
        state.calculations = null;
        state.couponCode = "";
        state.couponApplied = false;
        state.submitCartDataWrapper = createInitialSubmitCartDataWrapper();
      })
      .addCase(clearActiveCart.rejected, (state, action) => {
        state.clearingCart = false;
        const message =
          typeof action.payload === "string"
            ? action.payload
            : action.payload?.message || "فشل تفريغ السلة";
        state.clearingCartError = message;
        state.error = message;
      });

    // Recalculate
    builder
      .addCase(recalculateCart.pending, (state) => {
        state.calculating = true;
      })
      .addCase(recalculateCart.fulfilled, (state, action) => {
        state.calculating = false;
        state.calculations = action.payload;
      })
      .addCase(recalculateCart.rejected, (state) => {
        state.calculating = false;
      });

    // Submit Checkout
    builder
      .addCase(submitCheckout.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitCheckout.fulfilled, (state, action) => {
        state.submitting = false;
        state.lastOrderResult = action.payload;
        state.cart = null;
        state.calculations = null;
        state.submitCartDataWrapper = createInitialSubmitCartDataWrapper();
      })
      .addCase(submitCheckout.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      });
  },
});

export const {
  updateSubmitCartData,
  updateSubmitCartSheep,
  resetSubmitCartData,
  setSelectedDeliveryMethodId,
  setSelectedDeliveryTimeId,
  setSelectedPaymentMethodId,
  setSelectedAddressId,
  setDeliveryDate,
  setOrderNotes,
  clearCartError,
  clearLastOrderResult,
} = cartSlice.actions;

// --- Selectors ---
export const selectCart = (state) => state.cart.cart;
export const selectSubmitCartDataWrapper = (state) =>
  state.cart.submitCartDataWrapper;
export const selectCartCalculations = (state) => state.cart.calculations;
export const selectCartCouponCode = (state) => state.cart.couponCode;
export const selectCartCouponApplied = (state) => state.cart.couponApplied;
export const selectCartCouponError = (state) => state.cart.couponError;
export const selectSelectedDeliveryMethodId = (state) =>
  state.cart.selectedDeliveryMethodId;
export const selectSelectedDeliveryTimeId = (state) =>
  state.cart.selectedDeliveryTimeId;
export const selectSelectedPaymentMethodId = (state) =>
  state.cart.selectedPaymentMethodId;
export const selectDeliveryDate = (state) => state.cart.deliveryDate;
export const selectOrderNotes = (state) => state.cart.orderNotes;
export const selectLastOrderResult = (state) => state.cart.lastOrderResult;
export const selectCartLoading = (state) => state.cart.loading;
export const selectAddingToCart = (state) => state.cart.addingToCart;
export const selectClearingCart = (state) => state.cart.clearingCart;
export const selectCartSubmitting = (state) => state.cart.submitting;
export const selectCartError = (state) => state.cart.error;
export const selectAddToCartError = (state) => state.cart.addToCartError;
export const selectClearingCartError = (state) => state.cart.clearingCartError;

export default cartSlice.reducer;
