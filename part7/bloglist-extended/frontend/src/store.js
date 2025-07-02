import { configureStore } from '@reduxjs/toolkit';
import notificationReducer from './reducers/notificationSlice';

const store = configureStore({
  reducer: {
    notification: notificationReducer,
    // aquí se agregarán los demás reducers
  },
});

export default store;
