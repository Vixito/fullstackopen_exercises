import { createSlice } from '@reduxjs/toolkit';
import loginService from '../services/login';
import blogService from '../services/blogs';

const userSlice = createSlice({
  name: 'user',
  initialState: null,
  reducers: {
    setUser(state, action) {
      return action.payload;
    },
    clearUser() {
      return null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;

// Thunks
export const loginUser = (credentials) => {
  return async (dispatch) => {
    const userData = await loginService.login(credentials);
    window.localStorage.setItem('loggedBlogAppUser', JSON.stringify(userData));
    blogService.setToken && blogService.setToken(userData.token);
    dispatch(setUser(userData));
  };
};

export const logoutUser = () => {
  return (dispatch) => {
    window.localStorage.removeItem('loggedBlogAppUser');
    blogService.setToken && blogService.setToken(null);
    dispatch(clearUser());
  };
};

export const initializeUser = () => {
  return (dispatch) => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogAppUser');
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON);
      blogService.setToken && blogService.setToken(user.token);
      dispatch(setUser(user));
    }
  };
};

export default userSlice.reducer;
