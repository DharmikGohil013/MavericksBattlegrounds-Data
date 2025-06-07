const express = require('express');
const router = express.Router();
const User = require('../models/User');

// PATCH /winitem/:id - Update user's winItem
router.patch('/:id', async (req, res) => {
  try {
    const { winItem } = req.body;

    const validCrowns = [
      "Warden’s Crown",
      "Knight’s Crown",
      "Baron’s Crown",
      "Duke’s Crown",
      "Prince’s Crown",
      "King’s Crown",
      "Emperor’s Crown"
    ];

    if (!validCrowns.includes(winItem)) {
      return res.status(400).json({ message: 'Invalid crown name' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { winItem },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'Crown updated successfully', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /winitem/:id - Get user's crown info
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id, 'name winItem');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
