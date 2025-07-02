import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import Blog from './components/Blog';
import blogService from './services/blogs';
import loginService from './services/login';
import BlogForm from './components/BlogForm';
import Togglable from './components/Togglable';
import { showNotification } from './reducers/notificationSlice';
import Notification from './components/Notification';

// App principal
const App = () => {
  const [blogs, setBlogs] = useState([]);
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const blogFormRef = useRef();
  const dispatch = useDispatch();

  // Al iniciar, obtener todos los blogs
  useEffect(() => {
    blogService.getAll().then((blogs) => setBlogs(blogs));
  }, []);

  // Revisar si hay usuario guardado en localStorage al iniciar
  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogAppUser');
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON);
      setUser(user);
      // Si necesito token para peticiones:
      blogService.setToken && blogService.setToken(user.token);
    }
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const userData = await loginService.login({ username, password });
      window.localStorage.setItem('loggedBlogAppUser', JSON.stringify(userData));
      setUser(userData);
      setUsername('');
      setPassword('');
      blogService.setToken && blogService.setToken(userData.token);
      dispatch(showNotification('Login successful!', 'success'));
    } catch (error) {
      dispatch(showNotification('Wrong credentials', 'error'));
    }
  };

  // Cerrar sesión
  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogAppUser');
    setUser(null);
    // Si uso token, se podría limpiar aquí también
    blogService.setToken && blogService.setToken(null);
    dispatch(showNotification('Logged out', 'success'));
  };

  // Nueva función para crear un blog, llamada por BlogForm
  const addBlog = async (blogObject) => {
    try {
      const returnedBlog = await blogService.create(blogObject);
      setBlogs(blogs.concat(returnedBlog));
      dispatch(
        showNotification(
          `A new blog "${returnedBlog.title}" by ${returnedBlog.author} added!`,
          'success'
        )
      );
      blogFormRef.current.toggleVisibility(); // Oculta el formulario después de crear el blog
    } catch (error) {
      dispatch(showNotification('Error adding blog', 'error'));
    }
  };

  const handleLike = async (updatedBlog) => {
    try {
      const blogToUpdate = {
        user: updatedBlog.user.id || updatedBlog.user,
        likes: updatedBlog.likes,
        author: updatedBlog.author,
        title: updatedBlog.title,
        url: updatedBlog.url,
      };
      const returnedBlog = await blogService.update(updatedBlog.id, blogToUpdate);
      setBlogs(
        blogs.map((b) =>
          b.id === updatedBlog.id ? { ...returnedBlog, user: updatedBlog.user } : b
        )
      );
    } catch (error) {
      dispatch(showNotification('Error updating likes', 'error'));
    }
  };

  const handleRemove = async (blogToRemove) => {
    try {
      await blogService.remove(blogToRemove.id);
      setBlogs(blogs.filter((b) => b.id !== blogToRemove.id));
      dispatch(showNotification(`Blog "${blogToRemove.title}" removed`, 'success'));
    } catch (error) {
      dispatch(showNotification('Error removing blog', 'error'));
    }
  };

  if (user === null) {
    return (
      <div>
        <h2>Log in to application</h2>
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
      <Notification />
    </div>
  );
};

export default App;
