const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /api/users - create user if name is unique
router.post('/', async (req, res) => {
  const { name } = req.body;

  if (!name) return res.status(400).json({ message: 'Name is required' });

  try {
    const exists = await User.findOne({ name });
    if (exists) return res.status(409).json({ message: 'Name already exists' });

    const newUser = new User({ name });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
