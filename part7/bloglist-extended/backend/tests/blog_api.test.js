require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.test') })
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')

const api = supertest(app)
let token = null

jest.setTimeout(20000)

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({ username: 'root', name: 'Vixis', passwordHash })
  await user.save()

  const loginResponse = await api
    .post('/api/login')
    .send({ username: 'root', password: 'sekret' })

  token = loginResponse.body.token
  const userId = (await User.findOne({ username: 'root' }))._id

  await Blog.insertMany([
    { title: 'Blog 1', author: 'Author 1', url: 'url1', likes: 1, user: userId },
    { title: 'Blog 2', author: 'Author 2', url: 'url2', likes: 2, user: userId }
  ])

  console.log('>>> Token:', token)
  console.log('>>> UserId:', userId)

})

test('blogs are returned as json and correct amount', async () => {
  const response = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  expect(response.body).toHaveLength(2)
})

test('unique identifier property of blog posts is named id', async () => {
  const response = await api.get('/api/blogs')
  const blog = response.body[0]
  expect(blog.id).toBeDefined()
  expect(blog._id).toBeUndefined()
})

test('a valid blog can be added with a valid token', async () => {
  const newBlog = {
    title: 'Nuevo Blog',
    author: 'zzz',
    url: 'http://nuevoblog.com',
    likes: 10
  }

  const blogsAtStart = await api.get('/api/blogs')

  await api
    .post('/api/blogs')
    .set('Authorization', `bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await api.get('/api/blogs')
  expect(blogsAtEnd.body).toHaveLength(blogsAtStart.body.length + 1)

  const titles = blogsAtEnd.body.map(b => b.title)
  expect(titles).toContain('Nuevo Blog')
})

test('adding a blog without token returns 401', async () => {
  const newBlog = {
    title: 'Blog sin token',
    author: 'No autorizado',
    url: 'http://no-token.dev',
    likes: 1
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(401)
})

test('if likes property is missing from request, it defaults to 0', async () => {
  const newBlog = {
    title: 'Blog sin likes',
    author: 'Autor sin likes',
    url: 'http://nolikes.com'
  }

  const response = await api
    .post('/api/blogs')
    .set('Authorization', `bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  expect(response.body.likes).toBe(0)
})

test('blog without title or url is not added and returns 400', async () => {
  const blogWithoutTitle = {
    author: 'Autor sin título',
    url: 'http://notitle.com',
    likes: 1
  }

  const blogWithoutUrl = {
    title: 'Sin URL',
    author: 'Autor sin url',
    likes: 1
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `bearer ${token}`)
    .send(blogWithoutTitle)
    .expect(400)

  await api
    .post('/api/blogs')
    .set('Authorization', `bearer ${token}`)
    .send(blogWithoutUrl)
    .expect(400)
})

test('a blog can be deleted', async () => {
  const blogsAtStart = await api.get('/api/blogs')
  const blogToDelete = blogsAtStart.body[0]

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .set('Authorization', `bearer ${token}`)
    .expect(204)

  const blogsAtEnd = await api.get('/api/blogs')
  expect(blogsAtEnd.body).toHaveLength(blogsAtStart.body.length - 1)

  const titles = blogsAtEnd.body.map(b => b.title)
  expect(titles).not.toContain(blogToDelete.title)
})

test('a blog\'s likes can be updated', async () => {
  const blogsAtStart = await api.get('/api/blogs')
  const blogToUpdate = blogsAtStart.body[0]

  const updatedData = { ...blogToUpdate, likes: blogToUpdate.likes + 10 }

  const response = await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .set('Authorization', `bearer ${token}`)
    .send(updatedData)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  expect(response.body.likes).toBe(blogToUpdate.likes + 10)
})

afterAll(async () => {
  await mongoose.connection.close()
})
