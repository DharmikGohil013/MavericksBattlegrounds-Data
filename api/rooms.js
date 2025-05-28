// api/rooms.js
import mongoose from 'mongoose';
import Room from '../models/room'; // Adjust path if needed

const MONGO_URI = process.env.MONGO_URI;

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'POST') {
    const { roomname } = req.body;

    if (!roomname) {
      return res.status(400).json({ message: 'Room name is required' });
    }

    try {
      const exists = await Room.findOne({ roomname });
      if (exists) {
        return res.status(409).json({ message: 'Room name already exists' });
      }

      const newRoom = new Room({ roomname });
      await newRoom.save();

      return res.status(201).json({ message: 'Room created', room: newRoom });
    } catch (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
