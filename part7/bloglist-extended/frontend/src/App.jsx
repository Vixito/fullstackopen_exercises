import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Blog from './components/Blog';
import BlogForm from './components/BlogForm';
import Togglable from './components/Togglable';
import Notification from './components/Notification';
import { useNotification } from './contexts/NotificationContext';
import loginService from './services/login';
import blogService from './services/blogs';

const App = () => {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const blogFormRef = useRef();
  const showNotification = useNotification();
  const queryClient = useQueryClient();

  // Fetch blogs using React Query
  const {
    data: blogs,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['blogs'],
    queryFn: blogService.getAll,
  });

  // Mutation for creating a new blog
  const newBlogMutation = useMutation({
    mutationFn: blogService.create,
    onSuccess: (returnedBlog) => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      showNotification(
        `A new blog "${returnedBlog.title}" by ${returnedBlog.author} added!`,
        'success'
      );
      blogFormRef.current.toggleVisibility();
    },
    onError: (error) => {
      console.error('Error adding blog:', error);
      showNotification('Error adding blog', 'error');
    },
  });

  // Mutation for updating a blog (likes)
  const updateBlogMutation = useMutation({
    mutationFn: ({ id, blog }) => blogService.update(id, blog),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
    onError: (error) => {
      console.error('Error updating likes:', error);
      showNotification('Error updating likes', 'error');
    },
  });

  // Mutation for removing a blog
  const removeBlogMutation = useMutation({
    mutationFn: (blog) => blogService.remove(blog.id),
    onSuccess: (_, blog) => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      showNotification(`Blog "${blog.title}" removed`, 'success');
    },
    onError: (error) => {
      console.error('Error removing blog:', error);
      showNotification('Error removing blog', 'error');
    },
  });

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
  const addBlog = (blogObject) => {
    newBlogMutation.mutate(blogObject);
  };

  const handleLike = (blogToUpdate) => {
    updateBlogMutation.mutate({
      id: blogToUpdate.id,
      blog: {
        ...blogToUpdate,
        likes: blogToUpdate.likes + 1,
      },
    });
  };

  const handleRemove = (blogToRemove) => {
    if (window.confirm(`Remove blog ${blogToRemove.title} by ${blogToRemove.author}?`)) {
      removeBlogMutation.mutate(blogToRemove);
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
      <h2>blogs</h2>
      <Notification />
      <div>
        {user.name} logged in
        <button onClick={handleLogout}>logout</button>
      </div>
      <Togglable buttonLabel="create new blog" ref={blogFormRef}>
        <BlogForm createBlog={addBlog} />
      </Togglable>
      {blogs && blogs
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
