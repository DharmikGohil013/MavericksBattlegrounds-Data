const mongoose = require('mongoose');

const adminUserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
}, {
  timestamps: { createdAt: true, updatedAt: false } // only createdAt timestamp
});

const AdminUser = mongoose.model('AdminUser', adminUserSchema);

module.exports = AdminUser;
