const express = require('express');
const router = express.Router();

const User = require('../models/User');
const AdminUser = require('../models/AdminUser');

router.get('/counts', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAdmins = await AdminUser.countDocuments();

    res.json({
      totalUsers,
      totalAdmins
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
