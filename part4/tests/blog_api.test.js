require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.test') })
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')

const api = supertest(app)

jest.setTimeout(20000) // Set timeout to 20 seconds
beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany([
    { title: 'Blog 1', author: 'Author 1', url: 'url1', likes: 1 },
    { title: 'Blog 2', author: 'Author 2', url: 'url2', likes: 2 }
  ])
})

test('blogs are returned as json and correct amount', async () => {
  const response = await api.get('/api/blogs')
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

test('a valid blog can be added', async () => {
  const newBlog = {
    title: 'Nuevo Blog',
    author: 'zzz',
    url: 'http://nuevoblog.com',
    likes: 10
  }

  // Get blogs before the POST
  const blogsAtStart = await api.get('/api/blogs')

  // Make POST
  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  // Get blogs after the POST
  const blogsAtEnd = await api.get('/api/blogs')
  expect(blogsAtEnd.body).toHaveLength(blogsAtStart.body.length + 1)

  // Verify that the new blog is in the database
  const titles = blogsAtEnd.body.map(b => b.title)
  expect(titles).toContain('Nuevo Blog')
})

afterAll(async () => {
  await mongoose.connection.close()
})