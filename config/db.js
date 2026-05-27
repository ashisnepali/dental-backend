// config/db.js  –  MongoDB connection via Mongoose
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    console.error('   Ensure MongoDB is running and MONGO_URI is set in backend/.env');
    process.exit(1);
  }
};

module.exports = connectDB;
