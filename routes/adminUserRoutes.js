const express = require('express');
const router = express.Router();
const AdminUser = require('../models/AdminUser');

// POST /api/adminusers - create admin user
router.post('/', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const adminUser = new AdminUser({ username, password });
    await adminUser.save();

    res.status(201).json(adminUser);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Username must be unique' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
