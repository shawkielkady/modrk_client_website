/**
 * Customer Addresses Redux Slice
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import addressesApi from "./addressesApi";

// --- Async Thunks ---

export const fetchAddresses = createAsyncThunk(
  "addresses/fetchAddresses",
  async (_, { rejectWithValue }) => {
    try {
      return await addressesApi.getAddresses();
    } catch (err) {
      return rejectWithValue(err.message || "فشل تحميل العناوين المسجلة");
    }
  },
);

export const fetchDefaultAddress = createAsyncThunk(
  "addresses/fetchDefaultAddress",
  async (_, { rejectWithValue }) => {
    try {
      return await addressesApi.getDefaultAddress();
    } catch (err) {
      return rejectWithValue(err.message || "فشل تحميل العنوان الافتراضي");
    }
  },
);

export const addNewAddress = createAsyncThunk(
  "addresses/addNewAddress",
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const data = await addressesApi.addAddress(payload);
      dispatch(fetchAddresses());
      dispatch(fetchDefaultAddress());
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "فشل إضافة العنوان");
    }
  },
);

export const updateAddress = createAsyncThunk(
  "addresses/updateAddress",
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const data = await addressesApi.editAddress(payload);
      dispatch(fetchAddresses());
      dispatch(fetchDefaultAddress());
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "فشل تعديل العنوان");
    }
  },
);

// --- Initial State ---
const initialState = {
  addresses: [],
  defaultAddress: null,
  selectedAddressId: null,
  loading: false,
  saving: false,
  error: null,
};

// --- Slice ---
export const addressesSlice = createSlice({
  name: "addresses",
  initialState,
  reducers: {
    setSelectedAddressId: (state, action) => {
      state.selectedAddressId = action.payload;
    },
    clearAddressError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // List addresses
    builder
      .addCase(fetchAddresses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload;
        if (!state.selectedAddressId && action.payload.length > 0) {
          const def = action.payload.find((a) => a.is_default) || action.payload[0];
          state.selectedAddressId = def.id;
        }
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Default address
    builder
      .addCase(fetchDefaultAddress.fulfilled, (state, action) => {
        state.defaultAddress = action.payload;
        if (action.payload?.id && !state.selectedAddressId) {
          state.selectedAddressId = action.payload.id;
        }
      });

    // Add address
    builder
      .addCase(addNewAddress.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(addNewAddress.fulfilled, (state, action) => {
        state.saving = false;
        const id = action.payload?.id || action.payload?.address?.id;
        if (id) {
          state.selectedAddressId = id;
        }
      })
      .addCase(addNewAddress.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      });

    // Update address
    builder
      .addCase(updateAddress.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.saving = false;
        const id = action.payload?.id || action.payload?.address?.id;
        if (id) {
          state.selectedAddressId = id;
        }
      })
      .addCase(updateAddress.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      });
  },
});

export const { setSelectedAddressId, clearAddressError } = addressesSlice.actions;

// --- Selectors ---
export const selectAddresses = (state) => state.addresses.addresses;
export const selectDefaultAddress = (state) => state.addresses.defaultAddress;
export const selectSelectedAddressId = (state) => state.addresses.selectedAddressId;
export const selectSelectedAddress = (state) => {
  const list = state.addresses.addresses;
  const id = state.addresses.selectedAddressId;
  return list.find((a) => a.id === id) || state.addresses.defaultAddress || list[0] || null;
};
export const selectAddressLoading = (state) => state.addresses.loading;
export const selectAddressSaving = (state) => state.addresses.saving;
export const selectAddressError = (state) => state.addresses.error;

export default addressesSlice.reducer;

