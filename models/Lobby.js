const mongoose = require('mongoose');

const lobbySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: { expires: 3600 }, // document expires 3600 seconds (1 hour) after createdAt
  },
});

const Lobby = mongoose.model('Lobby', lobbySchema);

module.exports = Lobby;
