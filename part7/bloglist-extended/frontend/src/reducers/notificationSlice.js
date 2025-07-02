import { createSlice } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
  name: 'notification',
  initialState: { message: null, type: null },
  reducers: {
    setNotification(state, action) {
      return action.payload;
    },
    clearNotification() {
      return { message: null, type: null };
    },
  },
});

export const { setNotification, clearNotification } = notificationSlice.actions;

export default notificationSlice.reducer;

let timeoutId;

export const showNotification = (message, type = 'success', seconds = 4) => {
  return (dispatch) => {
    dispatch(setNotification({ message, type }));
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      dispatch(clearNotification());
    }, seconds * 1000);
  };
};
