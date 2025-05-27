import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true } // ✅ "name", not "username"
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

const MONGO_URI = process.env.MONGO_URI;

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'POST') {
    const { name } = req.body;

    if (!name) return res.status(400).json({ message: 'Name is required' });

    try {
      const exists = await User.findOne({ name });
      if (exists) return res.status(409).json({ message: 'Name already exists' });

      const newUser = new User({ name });
      await newUser.save();
      return res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
