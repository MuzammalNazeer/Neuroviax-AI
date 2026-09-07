const mongoose = require('mongoose');
const { enableInMemoryDb } = require('./inMemoryDb');

const connectDB = async () => {
  if (process.env.USE_IN_MEMORY === 'true') {
    console.log('[INFO] USE_IN_MEMORY is set to true. Activating In-Memory Demo Database Mode...');
    await enableInMemoryDb();
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/neuroviax', {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.warn(`[WARN] MongoDB connection failed: ${err.message}`);
    console.log('[INFO] Falling back to In-Memory Demo Database Mode with pre-seeded store data...');
    await enableInMemoryDb();
  }
};

module.exports = connectDB;

