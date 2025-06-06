const express = require('express');
const router = express.Router();

const User = require('../models/User');
const AdminUser = require('../models/AdminUser');
const Lobby = require('../models/Lobby');

router.get('/counts', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAdmins = await AdminUser.countDocuments();
    const totalLobby = await Lobby.countDocuments();

    // ✅ Fetch all user fields (full user info)
    const users = await User.find({}).lean();

    // ✅ Fetch all admin users
    const admins = await AdminUser.find({}).lean();

    // ✅ Fetch all lobby data
    const lobbies = await Lobby.find({}).lean();

    res.json({
      totalUsers,
      totalAdmins,
      totalLobby,
      users,
      admins,
      lobbies
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
