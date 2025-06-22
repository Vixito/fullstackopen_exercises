const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: {type: String, required: true, unique: true},
  name: String,
  passwordHash: String,
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.passwordHash // Do not show hash
  }
})

module.exports = mongoose.model('User', userSchema)