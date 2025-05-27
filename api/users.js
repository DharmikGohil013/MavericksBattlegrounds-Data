const connectDB = require('../utils/db');
const User = require('../models/User');

module.exports = async (req, res) => {
  await connectDB();

  if (req.method === 'POST') {
    const { name } = req.body;

    if (!name) return res.status(400).json({ message: 'Name is required' });

    const exists = await User.findOne({ name });
    if (exists) return res.status(409).json({ message: 'Name already exists' });

    const newUser = new User({ name });
    await newUser.save();
    return res.status(201).json({ message: 'User created successfully', user: newUser });
  }

  res.status(405).json({ message: 'Method not allowed' });
};
