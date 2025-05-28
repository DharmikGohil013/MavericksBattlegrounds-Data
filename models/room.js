// models/room.js
import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  roomname: {
    type: String,
    required: true,
    unique: true,
  },
});

const Room = mongoose.models.Room || mongoose.model('Room', roomSchema);

export default Room;
