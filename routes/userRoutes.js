const express = require('express');
const router = express.Router();
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// ✅ Create new user with optional welcome email and logo
router.post('/', async (req, res) => {
  try {
    const { name, email, avatarId, totalkill } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    if (!avatarId) {
      return res.status(400).json({ message: 'avatarId is required' });
    }

    const user = new User({
      name,
      email,
      avatarId: avatarId || 1,
      totalkill: totalkill || 0,
    });

    await user.save();

    let emailStatus = 'not sent';

    if (email) {
      const logoUrl = 'https://drive.google.com/uc?id=1cRCqvxF8qTzZyUksvKqhP7N-3xqozAN2';
      const poster1Url = 'https://drive.google.com/uc?id=1cRCqvxF8qTzZyUksvKqhP7N-3xqozAN2'; // Replace with real hosted URLs
      const poster2Url = 'https://drive.google.com/uc?id=1cRCqvxF8qTzZyUksvKqhP7N-3xqozAN2'; // Replace with real hosted URLs

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
        `Hi ${name}, welcome to the world of battle!`, // plain text fallback
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
      // Duplicate key error handling for name or email
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

// ✅ Update totalkill
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

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'totalkill updated successfully', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Update or add email
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

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Email updated successfully', user });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email must be unique' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Update avatarId
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

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Avatar updated successfully', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Update name
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

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Name updated successfully', user });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Name must be unique' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Get user by name
router.get('/name/:name', async (req, res) => {
  try {
    const user = await User.findOne({ name: req.params.name });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Bulk email to all users with customizable content and poster
router.post('/bulk-email', async (req, res) => {
  try {
    const { subject, content, posterUrl } = req.body;

    if (!subject || !content || !posterUrl) {
      return res.status(400).json({ message: 'subject, content, and posterUrl are required' });
    }

    // Fetch all users with emails
    const users = await User.find({ email: { $exists: true, $ne: null } });

    if (users.length === 0) {
      return res.status(404).json({ message: 'No users with emails found' });
    }

    const logoUrl = 'https://drive.google.com/uc?id=1cRCqvxF8qTzZyUksvKqhP7N-3xqozAN2';

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
        content, // plain text fallback
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

// ✅ Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
// ✅ General-purpose update for any user fields
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


module.exports = router;
