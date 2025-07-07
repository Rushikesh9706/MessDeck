const express = require('express');
const router = express.Router();
const Meal = require('../models/Meal');
const connectDB = require('../utils/mongodb');
const { authenticateUser } = require('../utils/middleware');

// GET /api/meals
router.get('/', authenticateUser, async (req, res) => {
  try {
    await connectDB();
    const { hallName, day, mealType } = req.query;
    let query = { available: true };
    if (hallName) query.hallName = hallName;
    if (day) query.day = day.toLowerCase();
    if (mealType) query.mealType = mealType.toLowerCase();
    const meals = await Meal.find(query);
    return res.json(meals);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 