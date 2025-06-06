const express = require('express');
const router = express.Router();
const Lobby = require('../models/Lobby');

// GET /api/lobbies — get all active lobbies
router.get('/', async (req, res) => {
  try {
    const lobbies = await Lobby.find().sort({ createdAt: -1 });
    res.json(lobbies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/lobbies — create a new lobby
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Lobby name is required' });
    }

    // Create new lobby
    const newLobby = new Lobby({ name });
    await newLobby.save();

    res.status(201).json(newLobby);
  } catch (err) {
    console.error(err);
    if (err.code === 11000) { // Duplicate key error
      return res.status(400).json({ error: 'Lobby name must be unique' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
