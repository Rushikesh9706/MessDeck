const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Placeholder route
dbConnected = false;
app.get('/', (req, res) => {
  res.send('Express backend is running!');
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mess-management';

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    dbConnected = true;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

const authRoutes = require('./api/auth');
const bookingsRoutes = require('./api/bookings');
const hallsRoutes = require('./api/halls');
const mealsRoutes = require('./api/meals');
const walletRoutes = require('./api/wallet');
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/halls', hallsRoutes);
app.use('/api/meals', mealsRoutes);
app.use('/api/wallet', walletRoutes);