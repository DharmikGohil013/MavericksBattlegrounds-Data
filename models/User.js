const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
  },
  avatarId: {
    type: Number,
    default: 1,
  },
  totalkill: {
    type: Number,
    default: 0,
  },
  level: {
    type: Number,
    default: 0,
  },
  totalMoney: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
