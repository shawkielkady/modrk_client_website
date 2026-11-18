/**
 * Farms & Livestock Redux Slice
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import farmsApi from "./farmsApi";

// --- Async Thunks ---

export const fetchFarms = createAsyncThunk(
  "farms/fetchFarms",
  async (params = {}, { rejectWithValue }) => {
    try {
      console.log(params, "this params from fetch farms");
      return await farmsApi.getFarms(params);
    } catch (err) {
      return rejectWithValue(err.message || "فشل تحميل بيانات المزارع");
    }
  },
  {
    condition: (params, { getState }) => {
      const { farms } = getState();

      // Don't duplicate in-flight requests
      if (farms.loading) {
        return false;
      }

      // If forced, always fetch
      if (params?.force) {
        return true;
      }

      // If user selected a specific filter (breed/farmTypeId/page/weight), fetch
      const hasSpecificFilter =
        params &&
        (params.farmTypeId !== undefined ||
          params.page !== undefined ||
          params.farm_weight_id !== undefined);

      if (hasSpecificFilter) {
        return true;
      }

      // If we already have farms in store and no specific filter is requested, skip network request
      if (farms.farms && farms.farms.length > 0) {
        return false;
      }

      return true;
    },
  },
);

export const fetchFarmDetails = createAsyncThunk(
  "farms/fetchFarmDetails",
  async (arg, { rejectWithValue }) => {
    try {
      const farmId =
        typeof arg === "object" && arg !== null
          ? (arg.farmId ?? arg.id)
          : arg;
      const farmTypeId =
        typeof arg === "object" && arg !== null
          ? (arg.farmTypeId ?? arg.farm_type_id)
          : undefined;
      return await farmsApi.getFarmDetails(farmId, {
        farm_type_id: farmTypeId,
      });
    } catch (err) {
      return rejectWithValue(err.message || "فشل تحميل تفاصيل المزرعة");
    }
  },
);

export const fetchFarmRatings = createAsyncThunk(
  "farms/fetchFarmRatings",
  async (arg, { rejectWithValue }) => {
    try {
      const farmId =
        typeof arg === "object" && arg !== null
          ? (arg.farmId ?? arg.id)
          : arg;
      const page =
        typeof arg === "object" && arg !== null ? (arg.page || 1) : 1;
      return await farmsApi.getFarmRatings(farmId, { page });
    } catch (err) {
      return rejectWithValue(err.message || "فشل تحميل تقييمات المزرعة");
    }
  },
);

// --- Initial State ---
const initialState = {
  farms: [],
  selectedFarm: null,
  farmRatings: [],
  selectedBreedId: null,
  selectedWeightId: null,
  pagination: {
    currentPage: 1,
    lastPage: 1,
    hasMorePages: false,
  },
  loading: false,
  detailsLoading: false,
  ratingsLoading: false,
  error: null,
};

// --- Slice ---
export const farmsSlice = createSlice({
  name: "farms",
  initialState,
  reducers: {
    setSelectedBreedId: (state, action) => {
      state.selectedBreedId = action.payload;
    },
    setSelectedWeightId: (state, action) => {
      state.selectedWeightId = action.payload;
    },
    clearSelectedFarm: (state) => {
      state.selectedFarm = null;
      state.farmRatings = [];
    },
    clearFarmsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // List Farms
    builder
      .addCase(fetchFarms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFarms.fulfilled, (state, action) => {
        state.loading = false;
        state.farms = action.payload.items;
        state.pagination = {
          currentPage: action.payload.currentPage,
          lastPage: action.payload.lastPage,
          hasMorePages: action.payload.hasMorePages,
        };
      })
      .addCase(fetchFarms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Farm Details
    builder
      .addCase(fetchFarmDetails.pending, (state) => {
        state.detailsLoading = true;
        state.selectedFarm = null;
      })
      .addCase(fetchFarmDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.selectedFarm = action.payload;
      })
      .addCase(fetchFarmDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload;
      });

    // Farm Ratings
    builder
      .addCase(fetchFarmRatings.pending, (state) => {
        state.ratingsLoading = true;
        state.farmRatings = [];
      })
      .addCase(fetchFarmRatings.fulfilled, (state, action) => {
        state.ratingsLoading = false;
        state.farmRatings = action.payload.items;
      })
      .addCase(fetchFarmRatings.rejected, (state) => {
        state.ratingsLoading = false;
        state.farmRatings = [];
      });
  },
});

export const {
  setSelectedBreedId,
  setSelectedWeightId,
  clearSelectedFarm,
  clearFarmsError,
} = farmsSlice.actions;

// --- Selectors ---
export const selectFarms = (state) => state.farms.farms;
export const selectSelectedFarm = (state) => state.farms.selectedFarm;
export const selectFarmRatings = (state) => state.farms.farmRatings;
export const selectSelectedBreedId = (state) => state.farms.selectedBreedId;
export const selectSelectedWeightId = (state) => state.farms.selectedWeightId;
export const selectFarmsLoading = (state) => state.farms.loading;
export const selectFarmsDetailsLoading = (state) => state.farms.detailsLoading;
export const selectFarmRatingsLoading = (state) => state.farms.ratingsLoading;
export const selectFarmsError = (state) => state.farms.error;

export default farmsSlice.reducer;
