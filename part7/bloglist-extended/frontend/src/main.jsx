import ReactDOM from 'react-dom/client';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationProvider } from './contexts/NotificationContext';
import { UserProvider } from './contexts/UserContext';
import { UsersProvider } from './contexts/UsersContext';
import { BlogProvider } from './contexts/BlogContext';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <NotificationProvider>
      <UserProvider>
        <UsersProvider>
          <BlogProvider>
            <App />
          </BlogProvider>
        </UsersProvider>
      </UserProvider>
    </NotificationProvider>
  </QueryClientProvider>
);
