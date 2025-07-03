import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Blog from './components/Blog';
import BlogForm from './components/BlogForm';
import Togglable from './components/Togglable';
import { showNotification, setNotification } from './reducers/notificationSlice';
import Notification from './components/Notification';
import { initializeBlogs, createBlog, likeBlog, deleteBlog } from './reducers/blogSlice';
import { loginUser, logoutUser, initializeUser } from './reducers/userSlice';

// App principal
const App = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const blogFormRef = useRef();
  const dispatch = useDispatch();
  const blogs = useSelector((state) => state.blogs);
  const user = useSelector((state) => state.user);

  // Al iniciar, obtener todos los blogs
  useEffect(() => {
    dispatch(initializeBlogs());
  }, [dispatch]);

  // Revisar si hay usuario guardado en localStorage al iniciar
  useEffect(() => {
    dispatch(initializeUser());
  }, [dispatch]);

  const handleLogin = async (event) => {
    event.preventDefault();
    console.log('Intentando login con:', { username, password });
    try {
      await dispatch(loginUser({ username, password }));
      setUsername('');
      setPassword('');
      console.log('Login exitoso');
      dispatch(showNotification('Login successful!', 'success'));
    } catch (error) {
      console.log('Error en login:', error);
      console.log('Despachando notificación de error...');
      // Prueba directa sin thunk
      dispatch(setNotification({ message: 'Wrong credentials', type: 'error' }));
      console.log('Notificación despachada directamente');
    }
  };

  // Cerrar sesión
  const handleLogout = () => {
    dispatch(logoutUser());
    dispatch(showNotification('Logged out', 'success'));
  };

  // Nueva función para crear un blog, llamada por BlogForm
  const addBlog = async (blogObject) => {
    try {
      await dispatch(createBlog(blogObject));
      dispatch(
        showNotification(
          `A new blog "${blogObject.title}" by ${blogObject.author} added!`,
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
      await dispatch(likeBlog(updatedBlog));
    } catch (error) {
      dispatch(showNotification('Error updating likes', 'error'));
    }
  };

  const handleRemove = async (blogToRemove) => {
    try {
      await dispatch(deleteBlog(blogToRemove.id));
      dispatch(showNotification(`Blog "${blogToRemove.title}" removed`, 'success'));
    } catch (error) {
      dispatch(showNotification('Error removing blog', 'error'));
    }
  };

  if (user === null) {
    return (
      <div>
        <Notification />
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
      <Notification />
      <h2>blogs</h2>
      <div>
        {user.name} logged in
        <button onClick={handleLogout}>logout</button>
      </div>
      <Togglable buttonLabel="create new blog" ref={blogFormRef}>
        <BlogForm createBlog={addBlog} />
      </Togglable>
      {blogs
        .slice()
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
