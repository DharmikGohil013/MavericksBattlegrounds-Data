// models/room.js
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const roomSchema = new mongoose.Schema({
  roomname: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    // required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600, // TTL - delete after 1 hour
  },
});


const Room = mongoose.models.Room || mongoose.model('Room', roomSchema);

export default Room;
