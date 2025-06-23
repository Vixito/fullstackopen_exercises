const errorHandler = (error, request, response, next) => {
  if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({ error: 'invalid token' })
  }

  if (error.name === 'TokenExpiredError') {
    return response.status(401).json({ error: 'expired token' })
  }

  if (error.name === 'CastError') {
    return response.status(400).json({ error: 'malformed id' })
  }

  next(error)
}

module.exports = errorHandler