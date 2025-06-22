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

afterAll(async () => {
  await mongoose.connection.close()
})