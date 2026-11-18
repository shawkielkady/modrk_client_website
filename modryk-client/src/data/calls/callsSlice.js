/**
 * Live Video Calls Redux Slice
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import callsApi from "./callsApi";

// --- Async Thunks ---

export const initiateCall = createAsyncThunk(
  "calls/initiateCall",
  async ({ farm_id, num_of_sheeps = 1 }, { rejectWithValue }) => {
    try {
      return await callsApi.startCall({ farm_id, num_of_sheeps });
    } catch (err) {
      return rejectWithValue(err.message || "فشل بدء المكالمة المباشرة مع الراعي");
    }
  },
);

export const terminateCall = createAsyncThunk(
  "calls/terminateCall",
  async (callId, { rejectWithValue }) => {
    try {
      return await callsApi.endCall(callId);
    } catch (err) {
      return rejectWithValue(err.message || "فشل إنهاء المكالمة");
    }
  },
);

export const sendHeartbeat = createAsyncThunk(
  "calls/sendHeartbeat",
  async (callId, { rejectWithValue }) => {
    try {
      return await callsApi.heartbeat(callId);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

export const bookCallReservation = createAsyncThunk(
  "calls/bookCallReservation",
  async ({ farm_id, num_of_sheeps = 1 }, { rejectWithValue }) => {
    try {
      return await callsApi.reserveCall({ farm_id, num_of_sheeps });
    } catch (err) {
      return rejectWithValue(err.message || "فشل حجز موعد المكالمة");
    }
  },
);

// --- Initial State ---
const initialState = {
  activeCall: null,
  callStatus: "idle", // "calling", "active", "ended", "failed"
  reservation: null,
  loading: false,
  error: null,
};

// --- Slice ---
export const callsSlice = createSlice({
  name: "calls",
  initialState,
  reducers: {
    clearActiveCall: (state) => {
      state.activeCall = null;
      state.callStatus = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Initiate Call
      .addCase(initiateCall.pending, (state) => {
        state.loading = true;
        state.callStatus = "calling";
        state.error = null;
      })
      .addCase(initiateCall.fulfilled, (state, action) => {
        state.loading = false;
        state.activeCall = action.payload;
        state.callStatus = "active";
      })
      .addCase(initiateCall.rejected, (state, action) => {
        state.loading = false;
        state.callStatus = "failed";
        state.error = action.payload;
      })

      // Terminate Call
      .addCase(terminateCall.fulfilled, (state) => {
        state.activeCall = null;
        state.callStatus = "ended";
      })

      // Reservation
      .addCase(bookCallReservation.fulfilled, (state, action) => {
        state.reservation = action.payload;
      });
  },
});

export const { clearActiveCall } = callsSlice.actions;

// --- Selectors ---
export const selectActiveCall = (state) => state.calls.activeCall;
export const selectCallStatus = (state) => state.calls.callStatus;
export const selectCallLoading = (state) => state.calls.loading;
export const selectCallError = (state) => state.calls.error;

export default callsSlice.reducer;

