/**
 * General & Master Data Redux Slice
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import generalApi from "./generalApi";

// --- Async Thunks ---

export const fetchSettings = createAsyncThunk(
  "general/fetchSettings",
  async (_, { rejectWithValue }) => {
    try {
      return await generalApi.getSettings();
    } catch (err) {
      return rejectWithValue(err.message || "فشل تحميل إعدادات التطبيق");
    }
  },
);

export const fetchFarmTypes = createAsyncThunk(
  "general/fetchFarmTypes",
  async (_, { rejectWithValue }) => {
    try {
      return await generalApi.getFarmTypes();
    } catch (err) {
      return rejectWithValue(err.message || "فشل تحميل سلالات المواشي");
    }
  },
);

export const fetchFarmWeights = createAsyncThunk(
  "general/fetchFarmWeights",
  async (_, { rejectWithValue }) => {
    try {
      return await generalApi.getFarmWeights();
    } catch (err) {
      return rejectWithValue(err.message || "فشل تحميل أوزان المواشي");
    }
  },
);

export const fetchDeliveryMethods = createAsyncThunk(
  "general/fetchDeliveryMethods",
  async (_, { rejectWithValue }) => {
    try {
      return await generalApi.getDeliveryMethods();
    } catch (err) {
      return rejectWithValue(err.message || "فشل تحميل طرق التوصيل");
    }
  },
);

export const fetchDeliveryTimes = createAsyncThunk(
  "general/fetchDeliveryTimes",
  async (_, { rejectWithValue }) => {
    try {
      return await generalApi.getDeliveryTimes();
    } catch (err) {
      return rejectWithValue(err.message || "فشل تحميل أوقات التوصيل");
    }
  },
);

export const fetchCuttingTypes = createAsyncThunk(
  "general/fetchCuttingTypes",
  async (_, { rejectWithValue }) => {
    try {
      return await generalApi.getCuttingTypes();
    } catch (err) {
      return rejectWithValue(err.message || "فشل تحميل خيارات التقطيع");
    }
  },
);

export const fetchPreparationTypes = createAsyncThunk(
  "general/fetchPreparationTypes",
  async (_, { rejectWithValue }) => {
    try {
      return await generalApi.getPreparationTypes();
    } catch (err) {
      return rejectWithValue(err.message || "فشل تحميل خيارات التغليف");
    }
  },
);

export const fetchPaymentMethods = createAsyncThunk(
  "general/fetchPaymentMethods",
  async (_, { rejectWithValue }) => {
    try {
      return await generalApi.getPaymentMethods();
    } catch (err) {
      return rejectWithValue(err.message || "فشل تحميل طرق الدفع");
    }
  },
);

export const fetchOrderStatusTypes = createAsyncThunk(
  "general/fetchOrderStatusTypes",
  async (_, { rejectWithValue }) => {
    try {
      return await generalApi.getOrderStatusTypes();
    } catch (err) {
      return rejectWithValue(err.message || "فشل تحميل حالات الطلب");
    }
  },
);

export const fetchCountries = createAsyncThunk(
  "general/fetchCountries",
  async (_, { rejectWithValue }) => {
    try {
      return await generalApi.getCountries();
    } catch (err) {
      return rejectWithValue(err.message || "فشل تحميل الدول");
    }
  },
);

export const fetchRegions = createAsyncThunk(
  "general/fetchRegions",
  async (countryId, { rejectWithValue }) => {
    try {
      return await generalApi.getRegions(countryId);
    } catch (err) {
      return rejectWithValue(err.message || "فشل تحميل المناطق");
    }
  },
);

export const fetchCities = createAsyncThunk(
  "general/fetchCities",
  async (regionId, { rejectWithValue }) => {
    try {
      return await generalApi.getCities(regionId);
    } catch (err) {
      return rejectWithValue(err.message || "فشل تحميل المدن");
    }
  },
);

/**
 * Loads all initial master data lookups in parallel
 */
export const fetchMasterData = createAsyncThunk(
  "general/fetchMasterData",
  async (_, { dispatch }) => {
    await Promise.allSettled([
      dispatch(fetchSettings()),
      dispatch(fetchFarmTypes()),
      dispatch(fetchFarmWeights()),
      dispatch(fetchDeliveryMethods()),
      dispatch(fetchDeliveryTimes()),
      dispatch(fetchCuttingTypes()),
      dispatch(fetchPreparationTypes()),
      dispatch(fetchPaymentMethods()),
      dispatch(fetchOrderStatusTypes()),
    ]);
  },
  {
    condition: (_, { getState }) => {
      const { general } = getState();
      if (general.farmTypes && general.farmTypes.length > 0) {
        return false;
      }
      if (general.loading || general.farmTypesLoading) {
        return false;
      }
      return true;
    },
  },
);

// --- Initial State ---
const initialState = {
  settings: null,
  farmTypes: [],
  farmWeights: [],
  deliveryMethods: [],
  deliveryTimes: [],
  cuttingTypes: [],
  preparationTypes: [],
  paymentMethods: [],
  orderStatusTypes: [],
  countries: [],
  regions: [],
  cities: [],
  loading: false,
  farmTypesLoading: false,
  error: null,
};

// --- Slice ---
export const generalSlice = createSlice({
  name: "general",
  initialState,
  reducers: {
    clearGeneralError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Settings
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Farm Types
      .addCase(fetchFarmTypes.pending, (state) => {
        state.farmTypesLoading = true;
      })
      .addCase(fetchFarmTypes.fulfilled, (state, action) => {
        state.farmTypesLoading = false;
        state.farmTypes = action.payload;
      })
      .addCase(fetchFarmTypes.rejected, (state) => {
        state.farmTypesLoading = false;
      })

      // Farm Weights
      .addCase(fetchFarmWeights.fulfilled, (state, action) => {
        state.farmWeights = action.payload;
      })

      // Delivery Methods
      .addCase(fetchDeliveryMethods.fulfilled, (state, action) => {
        state.deliveryMethods = action.payload;
      })

      // Delivery Times
      .addCase(fetchDeliveryTimes.fulfilled, (state, action) => {
        state.deliveryTimes = action.payload;
      })

      // Cutting Types
      .addCase(fetchCuttingTypes.fulfilled, (state, action) => {
        state.cuttingTypes = action.payload;
      })

      // Preparation Types
      .addCase(fetchPreparationTypes.fulfilled, (state, action) => {
        state.preparationTypes = action.payload;
      })

      // Payment Methods
      .addCase(fetchPaymentMethods.fulfilled, (state, action) => {
        state.paymentMethods = action.payload;
      })

      // Order Status Types
      .addCase(fetchOrderStatusTypes.fulfilled, (state, action) => {
        state.orderStatusTypes = action.payload;
      })

      // Countries, Regions, Cities
      .addCase(fetchCountries.fulfilled, (state, action) => {
        state.countries = action.payload;
      })
      .addCase(fetchRegions.fulfilled, (state, action) => {
        state.regions = action.payload;
      })
      .addCase(fetchCities.fulfilled, (state, action) => {
        state.cities = action.payload;
      });
  },
});

export const { clearGeneralError } = generalSlice.actions;

// --- Selectors ---
export const selectSettings = (state) => state.general.settings;
export const selectFarmTypes = (state) => state.general.farmTypes;
export const selectFarmTypesLoading = (state) => state.general.farmTypesLoading;
export const selectFarmWeights = (state) => state.general.farmWeights;
export const selectDeliveryMethods = (state) => state.general.deliveryMethods;
export const selectDeliveryTimes = (state) => state.general.deliveryTimes;
export const selectCuttingTypes = (state) => state.general.cuttingTypes;
export const selectPreparationTypes = (state) => state.general.preparationTypes;
export const selectPaymentMethods = (state) => state.general.paymentMethods;
export const selectOrderStatusTypes = (state) => state.general.orderStatusTypes;
export const selectCountries = (state) => state.general.countries;
export const selectRegions = (state) => state.general.regions;
export const selectCities = (state) => state.general.cities;
export const selectGeneralLoading = (state) => state.general.loading;
export const selectGeneralError = (state) => state.general.error;

export default generalSlice.reducer;

