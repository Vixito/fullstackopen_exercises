const mongoose = require('mongoose')
const express = require('express')
const app = express()

mongoose.set('strictQuery', false)
mongoose.connect(process.env.MONGODB_URI)

const cors = require('cors')
const blogsRouter = require('./controllers/blogs')

app.use(cors())
app.use(express.json())
app.use('/api/blogs', blogsRouter)

module.exports = app