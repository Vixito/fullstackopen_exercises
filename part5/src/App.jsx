import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import loginService from './services/login'
import BlogForm from './components/BlogForm'
import Togglable from './components/Togglable'

// Notificación reutilizable
const Notification = ({ message, type }) => {
  if (!message) return null
  const style = {
    color: type === 'success' ? 'green' : 'red',
    background: '#f4f4f4',
    fontSize: 20,
    border: `2px solid ${type === 'success' ? 'green' : 'red'}`,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    textAlign: 'center'
  }
  return <div style={style}>{message}</div>
}

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const blogFormRef = useRef()

  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs( blogs )
    )  
  }, [])

  // Revisar si hay usuario guardado en localStorage al iniciar
  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogAppUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      // Si necesito token para peticiones:
      blogService.setToken && blogService.setToken(user.token)
    }
  }, [])

  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const userData = await loginService.login({ username, password })
      window.localStorage.setItem('loggedBlogAppUser', JSON.stringify(userData))
      setUser(userData)
      setUsername('')
      setPassword('')
      blogService.setToken && blogService.setToken(userData.token)
      setSuccessMessage('Login successful!')
      setTimeout(() => setSuccessMessage(null), 4000)
    } catch (error) {
      setErrorMessage('Wrong credentials')
      setTimeout(() => setErrorMessage(null), 4000)
    }
  }

  // Cerrar sesión
  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogAppUser')
    setUser(null)
    // Si uso token, se podría limpiar aquí también
    blogService.setToken && blogService.setToken(null)
    setSuccessMessage('Logged out')
    setTimeout(() => setSuccessMessage(null), 4000)
  }

  // Nueva función para crear un blog, llamada por BlogForm
  const addBlog = async (blogObject) => {
    try {
      const returnedBlog = await blogService.create(blogObject)
      setBlogs(blogs.concat(returnedBlog))
      setSuccessMessage(`A new blog "${returnedBlog.title}" by ${returnedBlog.author} added!`)
      setTimeout(() => setSuccessMessage(null), 4000)
      blogFormRef.current.toggleVisibility() // Oculta el formulario después de crear el blog
    } catch (error) {
      setErrorMessage('Error adding blog')
      setTimeout(() => setErrorMessage(null), 4000)
    }
  }

  const handleLike = async (updatedBlog) => {
    try {
      const blogToUpdate = {
        user: updatedBlog.user.id || updatedBlog.user, // Ya lo tenía hecho
        likes: updatedBlog.likes,
        author: updatedBlog.author,
        title: updatedBlog.title,
        url: updatedBlog.url
      }
      const returnedBlog = await blogService.update(updatedBlog.id, blogToUpdate)
      setBlogs(blogs.map(b => b.id === updatedBlog.id ? { ...returnedBlog, user: updatedBlog.user } : b)) // Ya lo tenía hecho
    } catch (error) {
      setErrorMessage('Error updating likes')
      setTimeout(() => setErrorMessage(null), 4000)
    }
  }

  if (user === null) {
    return (
      <div>
        <h2>Log in to application</h2>
        <Notification message={errorMessage} type="error" />
        <Notification message={successMessage} type="success" />
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
    )
  }

  return (
    <div>
      <h2>blogs</h2>
      <Notification message={errorMessage} type="error" />
      <Notification message={successMessage} type="success" />
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
        .map(blog =>
          <Blog key={blog.id} blog={blog} handleLike={handleLike} />
      )}
    </div>
  )
}

export default App