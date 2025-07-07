const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Meal = require('../models/Meal');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const connectDB = require('../utils/mongodb');
const { authenticateUser } = require('../utils/middleware');

// GET /api/bookings
router.get('/', authenticateUser, async (req, res) => {
  try {
    await connectDB();
    const user = req.user;
    const { page = 1, limit = 10, status, mealType, startDate, endDate } = req.query;
    let query = { userId: user._id };
    if (status) query.status = status;
    if (mealType) query.mealType = mealType;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const bookings = await Booking.find(query)
      .populate('hallId')
      .populate('mealId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    const total = await Booking.countDocuments(query);
    return res.json({
      bookings,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/bookings
router.post('/', authenticateUser, async (req, res) => {
  try {
    await connectDB();
    const user = req.user;
    const { hallId, mealType, date } = req.body;
    if (!hallId || !mealType || !date) {
      return res.status(400).json({ error: 'Hall, meal type, and date are required' });
    }
    const Hall = require('../models/Hall');
    const hall = await Hall.findById(hallId);
    if (!hall) {
      return res.status(400).json({ error: 'Hall not found' });
    }
    const bookingDate = new Date(date);
    const dayName = bookingDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const meal = await Meal.findOne({
      hallName: hall.name,
      day: dayName,
      mealType: mealType.toLowerCase(),
      available: true,
    });
    if (!meal) {
      return res.status(400).json({ error: 'Meal not available for the selected hall, day, and type' });
    }
    if (user.walletBalance < meal.price) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }
    const existingBooking = await Booking.findOne({
      userId: user._id,
      hallId,
      mealType: mealType.toLowerCase(),
      date: bookingDate,
      status: { $ne: 'cancelled' },
    });
    if (existingBooking) {
      return res.status(400).json({ error: 'Booking already exists for this date, hall, and meal type' });
    }
    const booking = await Booking.create({
      userId: user._id,
      hallId,
      mealId: meal._id,
      mealType: meal.mealType,
      date: bookingDate,
      price: meal.price,
    });
    await User.findByIdAndUpdate(user._id, {
      $inc: { walletBalance: -meal.price },
    });
    await Transaction.create({
      userId: user._id,
      amount: meal.price,
      type: 'debit',
      description: `Booking for ${meal.mealType} - ${hall.name}`,
      bookingId: booking._id,
    });
    const populatedBooking = await Booking.findById(booking._id)
      .populate('hallId')
      .populate('mealId');
    return res.json(populatedBooking);
  } catch (error) {
    console.error('Error creating booking:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 