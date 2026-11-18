/**
 * Customer Auth Redux Slice
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authApi from "./authApi";
import { TokenStorage, UserStorage } from "./authModels";

// --- Async Thunks ---

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await authApi.login(credentials);
      if (data.token) {
        TokenStorage.set(data.token);
      }
      if (data.user) {
        UserStorage.set(data.user);
      }
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "فشل تسجيل الدخول");
    }
  },
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (formData, { rejectWithValue }) => {
    try {
      const data = await authApi.register(formData);
      if (data.token) {
        TokenStorage.set(data.token);
      }
      if (data.user) {
        UserStorage.set(data.user);
      }
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "فشل إنشاء الحساب");
    }
  },
);

export const verifyOtpUser = createAsyncThunk(
  "auth/verifyOtpUser",
  async (
    { phone, dial_code = initialState.pendingDialCode, otp_code },
    { rejectWithValue },
  ) => {
    try {
      const data = await authApi.verifyOtp({
        phone,
        dial_code,
        otp_code,
      });
      if (data.token) {
        TokenStorage.set(data.token);
      }
      if (data.user) {
        UserStorage.set(data.user);
      }
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "رمز التحقق غير صحيح");
    }
  },
);

export const resendOtpCode = createAsyncThunk(
  "auth/resendOtpCode",
  async (phone = initialState.pendingPhone, { rejectWithValue }) => {
    try {
      return await authApi.resendCode(phone);
    } catch (err) {
      return rejectWithValue(err.message || "فشل إعادة إرسال رمز التحقق");
    }
  },
);

export const fetchUserProfile = createAsyncThunk(
  "auth/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      return await authApi.getProfile();
    } catch (err) {
      return rejectWithValue(err.message || "فشل تحميل بيانات الملف الشخصي");
    }
  },
);

export const editUserProfile = createAsyncThunk(
  "auth/editUserProfile",
  async (formData, { rejectWithValue }) => {
    try {
      const updatedUser = await authApi.editProfile(formData);
      if (updatedUser) {
        UserStorage.set(updatedUser);
      }
      return updatedUser;
    } catch (err) {
      return rejectWithValue(err.message || "فشل تحديث الملف الشخصي");
    }
  },
);

export const changeUserPassword = createAsyncThunk(
  "auth/changeUserPassword",
  async (passwords, { rejectWithValue }) => {
    try {
      return await authApi.changePassword(passwords);
    } catch (err) {
      return rejectWithValue(err.message || "فشل تغيير كلمة المرور");
    }
  },
);

export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  await authApi.logout();
  TokenStorage.remove();
  UserStorage.remove();
  return null;
});

// --- Initial State ---
const savedToken = TokenStorage.get();
const savedUser = UserStorage.get();

const initialState = {
  user: savedUser || null,
  token: savedToken || null,
  isAuthenticated: Boolean(savedToken),
  pendingPhone: null,
  pendingDialCode: "+966",
  loading: false,
  logoutLoading: false,
  changePasswordLoading: false,
  error: null,
  successMessage: null,
};

// --- Slice ---
export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    setPendingPhone: (state, action) => {
      if (typeof action.payload === "string") {
        state.pendingPhone = action.payload;
      } else if (action.payload) {
        state.pendingPhone = action.payload.phone || null;
        state.pendingDialCode = action.payload.dial_code || "+966";
      }
    },
    forceLogout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      TokenStorage.remove();
    },
  },
  extraReducers: (builder) => {
    // --- Login ---
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = Boolean(action.payload.token);
        state.pendingPhone = action.payload.rawPhone;
        state.pendingDialCode = action.payload.dialCode;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // --- Register ---
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token || state.token;
        state.isAuthenticated = Boolean(
          action.payload.token && action.payload.isVerified,
        );
        state.pendingPhone = action.payload.rawPhone;
        state.pendingDialCode = action.payload.dialCode;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // --- Verify OTP ---
    builder
      .addCase(verifyOtpUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtpUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(verifyOtpUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // --- Profile Fetch & Edit ---
    builder
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(editUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        if (action.payload) {
          UserStorage.set(action.payload);
        }
        state.successMessage = "تم تحديث الملف الشخصي بنجاح";
      })
      .addCase(editUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // --- Change Password ---
    builder
      .addCase(changeUserPassword.pending, (state) => {
        state.loading = true;
        state.changePasswordLoading = true;
        state.error = null;
      })
      .addCase(changeUserPassword.fulfilled, (state) => {
        state.loading = false;
        state.changePasswordLoading = false;
        state.successMessage = "تم تغيير كلمة المرور بنجاح";
      })
      .addCase(changeUserPassword.rejected, (state, action) => {
        state.loading = false;
        state.changePasswordLoading = false;
        state.error = action.payload;
      });

    // --- Logout ---
    builder
      .addCase(logoutUser.pending, (state) => {
        state.logoutLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.logoutLoading = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.logoutLoading = false;
        state.error = null;
      });
  },
});

export const {
  clearAuthError,
  clearSuccessMessage,
  setPendingPhone,
  forceLogout,
} = authSlice.actions;

// --- Selectors ---
export const selectAuthUser = (state) => state.auth.user;
export const selectAuthToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectLogoutLoading = (state) => state.auth.logoutLoading;
export const selectChangePasswordLoading = (state) => state.auth.changePasswordLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthSuccessMessage = (state) => state.auth.successMessage;
export const selectPendingPhone = (state) => state.auth.pendingPhone;
export const selectPendingDialCode = (state) => state.auth.pendingDialCode;

export default authSlice.reducer;
