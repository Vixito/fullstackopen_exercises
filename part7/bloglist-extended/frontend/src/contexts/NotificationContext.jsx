import { createContext, useReducer, useContext } from 'react';

const NotificationContext = createContext();

const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'SET_NOTIFICATION':
      return action.payload;
    case 'CLEAR_NOTIFICATION':
      return { message: null, type: null };
    default:
      return state;
  }
};

export const NotificationProvider = ({ children }) => {
  const [notification, dispatch] = useReducer(notificationReducer, { message: null, type: null });

  return (
    <NotificationContext.Provider value={[notification, dispatch]}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationValue = () => {
  const [notification] = useContext(NotificationContext);
  return notification;
};

export const useNotificationDispatch = () => {
  const [, dispatch] = useContext(NotificationContext);
  return dispatch;
};

let timeoutId;

export const useNotification = () => {
  const dispatch = useNotificationDispatch();

  const showNotification = (message, type = 'success', seconds = 4) => {
    dispatch({ type: 'SET_NOTIFICATION', payload: { message, type } });
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      dispatch({ type: 'CLEAR_NOTIFICATION' });
    }, seconds * 1000);
  };

  return showNotification;
};
