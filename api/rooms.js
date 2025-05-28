// pages/api/rooms.js
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const MONGO_URI = process.env.MONGO_URI;

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
    expires: 3600, // 1 hour auto-delete
  },
});

const Room = mongoose.models.Room || mongoose.model('Room', roomSchema);

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
    const { roomname, password } = req.body;

    if (!roomname ) {
      return res.status(400).json({ message: 'Room name and password are required' });
    }

    if (password)
       {
        if (!/^\d+$/.test(password)) {
      return res.status(400).json({ message: 'Password must contain only numbers' });
    }
       }
    

    try {
      const exists = await Room.findOne({ roomname });
      if (exists) {
        return res.status(409).json({ message: 'Room name already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newRoom = new Room({
        roomname,
        password: hashedPassword,
      });

      await newRoom.save();

      return res.status(201).json({ message: 'Room created', room: { roomname: newRoom.roomname } });
    } catch (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
