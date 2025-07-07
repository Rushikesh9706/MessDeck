const mongoose = require('mongoose');

let isConnected = false;

async function connectDB() {
  const MONGO_URI = 'mongodb://localhost:27017/mess-management';
  if (isConnected) return;
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  isConnected = true;
}

module.exports = connectDB;