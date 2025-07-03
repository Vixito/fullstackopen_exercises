import { createContext, useReducer, useContext } from 'react';

const UserContext = createContext();

const userReducer = (state, action) => {
  switch (action.type) {
    case 'SET_USER':
      return action.payload;
    case 'CLEAR_USER':
      return null;
    default:
      return state;
  }
};

export const UserProvider = ({ children }) => {
  const [user, dispatch] = useReducer(userReducer, null);

  return <UserContext.Provider value={[user, dispatch]}>{children}</UserContext.Provider>;
};

export const useUserValue = () => {
  const [user] = useContext(UserContext);
  return user;
};

export const useUserDispatch = () => {
  const [, dispatch] = useContext(UserContext);
  return dispatch;
};

export const useUser = () => {
  const user = useUserValue();
  const dispatch = useUserDispatch();

  const setUser = (userData) => {
    dispatch({ type: 'SET_USER', payload: userData });
  };

  const clearUser = () => {
    dispatch({ type: 'CLEAR_USER' });
  };

  return { user, setUser, clearUser };
};
