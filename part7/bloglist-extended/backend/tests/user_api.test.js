require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.test') })
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const User = require('../models/user')

beforeEach(async () => {
  await User.deleteMany({})
  const user = new User({ username: 'root', name: 'Root User', passwordHash: 'hash' })
  await user.save()
})

test('no user created with short username', async () => {
  const newUser = {
    username: 'ab',
    name: 'Short Username',
    password: 'validpassword'
  }

  const result = await api
    .post('/api/users')
    .send(newUser)
    .expect(400)
  
  expect(result.body.error).toContain('Username must be at least 3 characters')
})

test('user with short password is not created', async () => {
  const newUser = {
    username: 'validuser',
    name: 'Short Password',
    password: 'pw'
  }

  const result = await api
    .post('/api/users')
    .send(newUser)
    .expect(400)
  
  expect(result.body.error).toContain('Password must be at least 3 characters')
})

test('do not create user with repeated username', async () => {
  const newUser = {
    username: 'root',
    name: 'Duplicate',
    password: 'password123'
  }

  const result = await api
    .post('/api/users')
    .send(newUser)
    .expect(400)
  
  expect(result.body.error).toContain('Username must be unique')
})

afterAll(async () => {
  await mongoose.connection.close()
})