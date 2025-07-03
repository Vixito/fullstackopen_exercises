import { useState, useEffect, useRef } from 'react';
import Blog from './components/Blog';
import BlogForm from './components/BlogForm';
import Togglable from './components/Togglable';
import Notification from './components/Notification';
import { useNotification } from './contexts/NotificationContext';
import loginService from './services/login';
import blogService from './services/blogs';

const App = () => {
  const [blogs, setBlogs] = useState([]);
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const blogFormRef = useRef();
  const showNotification = useNotification();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const initialBlogs = await blogService.getAll();
        setBlogs(initialBlogs);
      } catch (error) {
        console.error('Error fetching blogs:', error);
      }
    };
    fetchBlogs();
  }, []);

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
    setUser(null);
    blogService.setToken(null);
    showNotification('Logged out', 'success');
  };

  // Nueva función para crear un blog, llamada por BlogForm
  const addBlog = async (blogObject) => {
    try {
      const returnedBlog = await blogService.create(blogObject);
      setBlogs(blogs.concat(returnedBlog));
      showNotification(
        `A new blog "${blogObject.title}" by ${blogObject.author} added!`,
        'success'
      );
      blogFormRef.current.toggleVisibility(); // Oculta el formulario después de crear el blog
    } catch (error) {
      console.error('Error adding blog:', error);
      showNotification('Error adding blog', 'error');
    }
  };

  const handleLike = async (blogToUpdate) => {
    try {
      const updatedBlog = await blogService.update(blogToUpdate.id, {
        ...blogToUpdate,
        likes: blogToUpdate.likes + 1,
      });
      setBlogs(blogs.map((blog) => (blog.id !== blogToUpdate.id ? blog : updatedBlog)));
    } catch (error) {
      console.error('Error updating likes:', error);
      showNotification('Error updating likes', 'error');
    }
  };

  const handleRemove = async (blogToRemove) => {
    try {
      if (window.confirm(`Remove blog ${blogToRemove.title} by ${blogToRemove.author}?`)) {
        await blogService.remove(blogToRemove.id);
        setBlogs(blogs.filter((blog) => blog.id !== blogToRemove.id));
        showNotification(`Blog "${blogToRemove.title}" removed`, 'success');
      }
    } catch (error) {
      console.error('Error removing blog:', error);
      showNotification('Error removing blog', 'error');
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

  return (
    <div>
      <h2>blogs</h2>
      <Notification />
      <div>
        {user.name} logged in
        <button onClick={handleLogout}>logout</button>
      </div>
      <Togglable buttonLabel="create new blog" ref={blogFormRef}>
        <BlogForm createBlog={addBlog} />
      </Togglable>
      {blogs
        .slice() // copia para no mutar el estado original
        .sort((a, b) => b.likes - a.likes)
        .map((blog) => (
          <Blog
            key={blog.id}
            blog={blog}
            handleLike={handleLike}
            handleRemove={handleRemove}
            currentUser={user}
          />
        ))}
    </div>
  );
};

export default App;
