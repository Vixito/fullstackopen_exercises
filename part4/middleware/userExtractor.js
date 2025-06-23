const jwt = require('jsonwebtoken')
const User = require('../models/user')

const userExtractor = async (request, response, next) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    try {
      const decodedToken = jwt.verify(authorization.substring(7), process.env.SECRET)
      if (!decodedToken.id) {
        return response.status(401).json({ error: 'invalid token' })
      }
      const user = await User.findById(decodedToken.id)
      request.user = user
    } catch (error) {
      return response.status(401).json({ error: 'invalid or expired token' })
    }
  } else {
    return response.status(401).json({ error: 'token missing' })
  }
  next()
}

module.exports = userExtractor
