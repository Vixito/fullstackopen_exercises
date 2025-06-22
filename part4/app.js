const mongoose = require('mongoose')
const express = require('express')
const app = express()

mongoose.set('strictQuery', false)
mongoose.connect(process.env.MONGODB_URI)

const cors = require('cors')
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')

app.use(cors())
app.use(express.json())
app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)

module.exports = app