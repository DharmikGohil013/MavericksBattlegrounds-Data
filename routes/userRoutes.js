const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const user = new User({ name });
    await user.save();

    res.status(201).json(user);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'User name must be unique' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
