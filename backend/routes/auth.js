const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyPassword, generateToken, hashPassword } = require('../utils/auth');
const connectDB = require('../utils/mongodb');
const { authenticateUser } = require('../utils/middleware');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    await connectDB();
    const { rollNo, password } = req.body;

    if (!rollNo || !password) {
      return res.status(400).json({ error: 'Roll number and password are required' });
    }

    const user = await User.findOne({ rollNo });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user._id.toString());

    return res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        rollNo: user.rollNo,
        walletBalance: user.walletBalance,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    await connectDB();
    const { name, rollNo, password } = req.body;
    if (!name || !rollNo || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (!/^\d{6}$/.test(rollNo)) {
      return res.status(400).json({ error: 'Roll number must be exactly 6 digits (e.g., 240670)' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    const existingUser = await User.findOne({ rollNo });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this roll number already exists' });
    }
    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      name,
      rollNo,
      password: hashedPassword,
      walletBalance: 1000,
    });
    const token = generateToken(user._id.toString());
    return res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        rollNo: user.rollNo,
        walletBalance: user.walletBalance,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateUser, async (req, res) => {
  try {
    return res.json(req.user);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/auth/me
router.patch('/me', authenticateUser, async (req, res) => {
  try {
    await connectDB();
    const { name, rollNo, password } = req.body;
    const update = {};
    if (name) update.name = name;
    if (rollNo) update.rollNo = rollNo;
    if (password) update.password = await hashPassword(password);
    const updatedUser = await User.findByIdAndUpdate(req.user._id, update, { new: true }).select('-password');
    return res.json(updatedUser);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 