const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  email: String,
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
