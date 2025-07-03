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
      <div>
        <h2>Log in to application</h2>
        <Notification />
        <form onSubmit={handleLogin}>
          <div>
            username
            <input
              type="text"
              value={username}
              name="Username"
              onChange={({ target }) => setUsername(target.value)}
            />
          </div>
          <div>
            password
            <input
              type="password"
              value={password}
              name="Password"
              onChange={({ target }) => setPassword(target.value)}
            />
          </div>
          <button type="submit">login</button>
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
      <div style={{ padding: '10px', backgroundColor: '#f0f0f0', marginBottom: '20px' }}>
        <Link to="/" style={{ marginRight: '10px' }}>
          blogs
        </Link>
        <Link to="/users" style={{ marginRight: '10px' }}>
          users
        </Link>
        <span style={{ marginLeft: '10px' }}>
          {user.name} logged in
          <button onClick={handleLogout} style={{ marginLeft: '5px' }}>
            logout
          </button>
        </span>
      </div>

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
  );
};

export default App;
