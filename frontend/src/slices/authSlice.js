import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: JSON.parse(localStorage.getItem('token')) || null,
  role: JSON.parse(localStorage.getItem('role'))|| null,
  user: JSON.parse(localStorage.getItem('user')) || null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUserData: (state, action) => {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    setToken: (state, action) => {
      state.token = action.payload;
      localStorage.setItem('token', action.payload);
    },
    setRole: (state, action) => {
      state.role = action.payload;
      localStorage.setItem('role', action.payload);
    },
    setLogout: (state) => {
      state.token = null;
      state.role = null;
      state.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('user');
    },
  },
});

export const { setUserData, setToken, setRole, setLogout } = authSlice.actions;
export default authSlice.reducer;