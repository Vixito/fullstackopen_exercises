import { createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAll } from '../services/users';

const UsersContext = createContext();

export const UsersProvider = ({ children }) => {
  // Query for fetching users
  const {
    data: users,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['users'],
    queryFn: getAll,
  });

  const value = {
    users,
    isLoading,
    error,
  };

  return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>;
};

export const useUsers = () => {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error('useUsers must be used within a UsersProvider');
  }
  return context;
};
