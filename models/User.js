const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    unique: true,       // <-- make email unique
    sparse: true,       // <-- important to allow multiple docs without email
  },
  avatarId: {
    type: Number,
    required: true,
    default: 1,
  },
  totalkill: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true, // adds createdAt and updatedAt
});

const User = mongoose.model('User', userSchema);

module.exports = User;
