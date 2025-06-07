const express = require('express');
const router = express.Router();
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'a3f5e8b9c2d4f671234567890abcdef1234567890abcdef1234567890abcdef'; // Use env var in productio

// JWT authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Expect 'Bearer <token>'

  if (!token) return res.status(401).json({ message: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = user; // Attach user payload from token to request
    next();
  });
}

// =====================
// Routes
// =====================

// POST /login - Login user by name, returns JWT token
router.post('/login', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const user = await User.findOne({ name });

    if (!user) {
      return res.status(401).json({ message: 'Invalid name or user not found' });
    }

    const payload = { id: user._id, name: user.name };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarId: user.avatarId,
        totalkill: user.totalkill,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST / - Create new user (with optional welcome email)
router.post('/', async (req, res) => {
  try {
    const { name, email, avatarId, totalkill } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    

    const user = new User({
      name,
      email,
      avatarId:  1,
      totalkill: totalkill || 0,
    });

    await user.save();

    let emailStatus = 'not sent';

    if (email) {
      const logoUrl = 'https://drive.google.com/uc?id=1PaWy6UhkC5mNAsiqpkMM5Lv71VPbLZf5';
      const poster1Url = 'https://drive.google.com/uc?id=12WRir1qJDVyoB4bvl2lvszCyr3PlPF2Y'; // Replace if needed
      // const poster2Url = logoUrl; // Replace if needed

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; text-align: center; background-color: #111; color: #fff; padding: 30px;">
          <img src="${logoUrl}" alt="App Logo" style="max-width: 150px; margin-bottom: 20px;" />
          <h1 style="color: #00ffcc;">Welcome, ${name}!</h1>
          <p style="font-size: 18px;color: #ffcc00;">You've entered the arena. Get ready to fight, win, and become a legend!</p>
          <p style="margin: 20px 0;color: #ffcc00;">🔥 Join live lobbies, crush enemies, and climb the kill leaderboard!</p>
          <img src="${poster1Url}" alt="Game Offer 1" style="max-width: 100%; margin: 20px 0;" />
          <img src="${poster2Url}" alt="Game Offer 2" style="max-width: 100%; margin-bottom: 30px;" />
          <h2 style="color: #ffcc00;">💥 Don’t just play… Dominate.</h2>
          <p style="color: #ffcc00;">Every kill earns you XP. Every win brings glory. 🕹️</p>
          <p style="margin-top: 30px; color: #ffcc00;">
            Need help or support? Visit us anytime:<br/>
            <a href="https://dharmikgohil.fun/" style="color: #00ccff; text-decoration: underline;">https://dharmikgohil.fun/</a>
          </p>
        </div>
      `;

      const sent = await sendEmail(
        email,
        'Welcome to the Game!',
        `Hi ${name}, welcome to the world of battle!`,
        htmlContent
      );

      emailStatus = sent ? 'sent' : 'failed';
    }

    res.status(201).json({
      message: 'User created successfully',
      user,
      emailStatus,
    });

  } catch (err) {
    if (err.code === 11000) {
      if (err.keyPattern && err.keyPattern.name) {
        return res.status(400).json({ message: 'Name must be unique' });
      }
      if (err.keyPattern && err.keyPattern.email) {
        return res.status(400).json({ message: 'Email must be unique' });
      }
      return res.status(400).json({ message: 'Duplicate key error' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
});

// PATCH /:id/kill - Update totalkill
router.patch('/:id/kill', async (req, res) => {
  try {
    const { totalkill } = req.body;

    if (typeof totalkill !== 'number') {
      return res.status(400).json({ message: 'totalkill must be a number' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { totalkill },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'totalkill updated successfully', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /:id/email - Update or add email
// PATCH /:id/email - Update or add email and send welcome email
router.patch('/:id/email', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { email },
      { new: true, runValidators: true }
    );

    if (!user) return res.status(404).json({ message: 'User not found' });

    // --- Send welcome email logic ---
    let emailStatus = 'not sent';
    try {
      const logoUrl = 'https://drive.google.com/uc?id=1PaWy6UhkC5mNAsiqpkMM5Lv71VPbLZf5';
      const poster1Url = 'https://drive.google.com/uc?id=12WRir1qJDVyoB4bvl2lvszCyr3PlPF2Y'; // Or any other relevant image
      

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; text-align: center; background-color: #111; color: #fff; padding: 30px;">
          <img src="${logoUrl}" alt="App Logo" style="max-width: 150px; margin-bottom: 20px;" />
          <h1 style="color: #00ffcc;">Challenger Detected, ${user.name}!</h1>
          <p style="font-size: 18px;color: #ffcc00;">You've entered the arena. Get ready to fight, win, and become a legend!</p>
          <p style="margin: 20px 0;color: #ffcc00;">🔥 Join live lobbies, crush enemies, and climb the kill leaderboard!</p>
          <img src="${poster1Url}" alt="Game Offer 1" style="max-width: 50%; margin: 20px 0;" />
          
          <h2 style="color: #ffcc00;">💥 Don’t just play… Dominate.</h2>
          <p style="color: #ffcc00;">Every kill earns you XP. Every win brings glory. 🕹️</p>
          <p style="margin-top: 30px; color: #ffcc00;">
            Need help or support? Visit us anytime:<br/>
            <a href="https://dharmikgohil.fun/" style="color: #00ccff; text-decoration: underline;">https://dharmikgohil.fun/</a>
          </p>
        </div>
      `;

      const sent = await sendEmail(
        email,
        'Welcome to the Game!',
        `Hi ${user.name}, welcome to the world of battle!`,
        htmlContent
      );
      emailStatus = sent ? 'sent' : 'failed';
    } catch (e) {
      emailStatus = 'failed';
    }

    res.json({ message: 'Email updated successfully', user, emailStatus });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email must be unique' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});


// PATCH /:id/avatar - Update avatarId
router.patch('/:id/avatar', async (req, res) => {
  try {
    const { avatarId } = req.body;

    if (typeof avatarId !== 'number') {
      return res.status(400).json({ message: 'avatarId must be a number' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { avatarId },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'Avatar updated successfully', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /:id/name - Update name
router.patch('/:id/name', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true, runValidators: true }
    );

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'Name updated successfully', user });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Name must be unique' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /name/:name - Get user by name
router.get('/name/:name', async (req, res) => {
  try {
    const user = await User.findOne({ name: req.params.name });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /bulk-email - Bulk email to all users with customizable content and poster
router.post('/bulk-email', async (req, res) => {
  try {
    const { subject, content, posterUrl } = req.body;

    if (!subject || !content || !posterUrl) {
      return res.status(400).json({ message: 'subject, content, and posterUrl are required' });
    }

    const users = await User.find({ email: { $exists: true, $ne: null } });

    if (users.length === 0) {
      return res.status(404).json({ message: 'No users with emails found' });
    }

    const logoUrl = 'https://drive.google.com/uc?id=1PaWy6UhkC5mNAsiqpkMM5Lv71VPbLZf5';

    const results = [];

    for (const user of users) {
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; text-align: center; background-color: #111; color: #fff; padding: 30px;">
          <img src="${logoUrl}" alt="App Logo" style="max-width: 150px; margin-bottom: 20px;" />
          <h2 style="color: #00ffcc;">Hello, ${user.name}!</h2>
          <p style="font-size: 18px;">${content}</p>
          <img src="${posterUrl}" alt="Game Poster" style="max-width: 100%; margin: 20px 0;" />
          <p style="margin-top: 30px; font-style: italic; color: #ffcc00;">
            Play hard, climb higher! 🕹️🔥<br />
            Support: <a href="https://dharmikgohil.fun/" style="color: #00ccff; text-decoration: underline;" target="_blank">dharmikgohil.fun</a>
          </p>
        </div>
      `;

      const sent = await sendEmail(
        user.email,
        subject,
        content,
        htmlContent
      );

      results.push({ email: user.email, status: sent ? 'sent' : 'failed' });
    }

    res.json({
      message: `Bulk email sent to ${users.length} users`,
      results,
    });
  } catch (err) {
    console.error('Bulk email error:', err);
    res.status(500).json({ message: 'Server error during bulk email' });
  }
});

// GET /:id - Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /:id - General update user
router.patch('/:id', async (req, res) => {
  try {
    const updateData = req.body;

    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No update data provided' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User updated successfully', user });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Duplicate value: name or email must be unique' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /:id - Delete user by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User deleted successfully', user: deletedUser });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
