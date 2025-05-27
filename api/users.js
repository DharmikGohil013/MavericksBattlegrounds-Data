// api/users.js
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../utils/db');

module.exports = async (req, res) => {
  await connectDB();

  if (req.method === 'POST') {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    try {
      const exists = await User.findOne({ name });
      if (exists) return res.status(409).json({ message: 'Name already exists' });

      const newUser = new User({ name });
      await newUser.save();
      return res.status(201).json({ message: 'User created', user: newUser });
    } catch (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
