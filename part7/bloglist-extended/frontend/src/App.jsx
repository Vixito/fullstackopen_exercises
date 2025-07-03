import { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import BlogList from './components/BlogList';
import Notification from './components/Notification';
import Users from './components/Users';
import User from './components/User';
import BlogView from './components/BlogView';
import { useNotification } from './contexts/NotificationContext';
import { useUser } from './contexts/UserContext';
import { useBlog } from './contexts/BlogContext';
import loginService from './services/login';
import blogService from './services/blogs';

const App = () => {
  const { user, setUser, clearUser } = useUser();
  const { isLoading, error, createBlog, updateBlog, removeBlog } = useBlog();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const showNotification = useNotification();

  // Revisar si hay usuario guardado en localStorage al iniciar
  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser');
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON);
      setUser(user);
      blogService.setToken(user.token);
    }
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const user = await loginService.login({
        username,
        password,
      });

      window.localStorage.setItem('loggedBlogappUser', JSON.stringify(user));
      blogService.setToken(user.token);
      setUser(user);
      setUsername('');
      setPassword('');
      showNotification('Login successful!', 'success');
    } catch (error) {
      console.error('Login error:', error);
      showNotification('Wrong credentials', 'error');
    }
  };

  // Cerrar sesión
  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogappUser');
    clearUser();
    blogService.setToken(null);
    showNotification('Logged out', 'success');
  };

  // Nueva función para crear un blog, llamada por BlogForm
  const addBlog = (blogObject, blogFormRef) => {
    createBlog(blogObject, {
      onSuccess: () => {
        if (blogFormRef && blogFormRef.current) {
          blogFormRef.current.toggleVisibility();
        }
      },
    });
  };

  const handleLike = (blogToUpdate) => {
    const updatedBlog = {
      ...blogToUpdate,
      likes: blogToUpdate.likes + 1,
      user: blogToUpdate.user.id || blogToUpdate.user, // Ensure user is ID
    };

    updateBlog({
      id: blogToUpdate.id,
      blog: updatedBlog,
    });
  };

  const handleRemove = (blogToRemove) => {
    if (window.confirm(`Remove blog ${blogToRemove.title} by ${blogToRemove.author}?`)) {
      removeBlog(blogToRemove);
    }
  };

  if (user === null) {
    return (
      <div style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
        <h2>Log in to application</h2>
        <Notification />
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              value={username}
              name="Username"
              onChange={({ target }) => setUsername(target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              value={password}
              name="Password"
              onChange={({ target }) => setPassword(target.value)}
              className="form-input"
            />
          </div>
          <button type="submit" className="btn btn-primary">login</button>
        </form>
      </div>
    );
  }

  if (isLoading) {
    return <div>Loading blogs...</div>;
  }

  if (error) {
    return <div>Error loading blogs: {error.message}</div>;
  }

  return (
    <div>
      <div className="navbar">
        <div>
          <Link to="/">blogs</Link>
          <Link to="/users">users</Link>
        </div>
        <div className="user-info">
          <span>{user.name} logged in</span>
          <button onClick={handleLogout} className="logout-btn">
            logout
          </button>
        </div>
      </div>

      <div style={{ padding: '0 2rem' }}>
        <h2>blog app</h2>
        <Notification />

        <Routes>
          <Route
            path="/"
            element={
              <BlogList addBlog={addBlog} handleLike={handleLike} handleRemove={handleRemove} />
            }
          />
          <Route path="/users" element={<Users />} />
          <Route path="/users/:id" element={<User />} />
          <Route path="/blogs/:id" element={<BlogView />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
