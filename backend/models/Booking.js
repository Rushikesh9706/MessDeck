const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  hallId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hall',
    required: true,
  },
  mealId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meal',
    required: true,
  },
  mealType: {
    type: String,
    required: true,
    enum: ['breakfast', 'lunch', 'dinner'],
  },
  date: {
    type: Date,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['booked', 'consumed', 'cancelled'],
    default: 'booked',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Booking', BookingSchema);
