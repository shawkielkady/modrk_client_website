import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../data/auth/authSlice";
import generalReducer from "../data/general/generalSlice";
import farmsReducer from "../data/farms/farmsSlice";
import addressesReducer from "../data/addresses/addressesSlice";
import cartReducer from "../data/cart/cartSlice";
import ordersReducer from "../data/orders/ordersSlice";
import callsReducer from "../data/calls/callsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    general: generalReducer,
    farms: farmsReducer,
    addresses: addressesReducer,
    cart: cartReducer,
    orders: ordersReducer,
    calls: callsReducer,
  },
  // devTools: process.env.NODE_ENV !== "production",
});

export default store;
