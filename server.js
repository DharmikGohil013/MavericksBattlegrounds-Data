require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');

const app = express();

// Connect to DB
connectDB();

// Middleware
app.use(express.json());

// Routes prefix
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/adminusers', require('./routes/adminUserRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));
app.use('/api/lobbies', require('./routes/lobby'));



// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
