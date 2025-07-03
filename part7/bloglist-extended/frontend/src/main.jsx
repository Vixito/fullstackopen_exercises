import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationProvider } from './contexts/NotificationContext';
import { UserProvider } from './contexts/UserContext';
import { UsersProvider } from './contexts/UsersContext';
import { BlogProvider } from './contexts/BlogContext';
import './index.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <NotificationProvider>
      <UserProvider>
        <UsersProvider>
          <BlogProvider>
            <Router>
              <App />
            </Router>
          </BlogProvider>
        </UsersProvider>
      </UserProvider>
    </NotificationProvider>
  </QueryClientProvider>
);
