import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "../slices/authSlice";
import cartReducer from "../slices/cartSlice";

const rootReducer=combineReducers({
      auth: authReducer,
      cart: cartReducer,

    // Add other reducers here if needed-
})

export default rootReducer;