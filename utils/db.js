// utils/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  if (mongoose.connections[0].readyState) return; // already connected
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
};

module.exports = connectDB;
