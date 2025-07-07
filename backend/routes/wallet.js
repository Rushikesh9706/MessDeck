const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const connectDB = require('../utils/mongodb');
const { authenticateUser } = require('../utils/middleware');

// GET /api/wallet
router.get('/', authenticateUser, async (req, res) => {
  try {
    await connectDB();
    const user = req.user;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const transactions = await Transaction.find({ userId: user._id })
      .populate('bookingId')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    const total = await Transaction.countDocuments({ userId: user._id });
    return res.json({
      transactions,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      currentBalance: user.walletBalance,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/wallet
router.post('/', authenticateUser, async (req, res) => {
  try {
    await connectDB();
    const user = req.user;
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $inc: { walletBalance: amount } },
      { new: true }
    );
    await Transaction.create({
      userId: user._id,
      amount,
      type: 'credit',
      description: `Wallet top-up`,
    });
    return res.json({ newBalance: updatedUser.walletBalance });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 