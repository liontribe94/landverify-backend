const mongoose = require('mongoose');

console.log('Starting database configuration...');

const connectDB = async () => {
  try {
    // Load environment variables
    if (!process.env.MONGODB_URI && !process.env.MONGO_URL) {
      // If no MongoDB URI is provided, use localhost for development
      process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/landverify';
      console.log('No MongoDB URI found in environment variables, using localhost');
    }

    const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URL;
    console.log('MongoDB URI found:', mongoURI.replace(/\/\/(.*?:.*?@)?/, '//***:***@'));

    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      heartbeatFrequencyMS: 30000,
    };

    await mongoose.connect(mongoURI, options);

    mongoose.connection.on('connected', () => {
      console.log('Successfully connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', {
        name: err.name,
        message: err.message,
        code: err.code,
        codeName: err.codeName
      });
    });

    mongoose.connection.on('disconnected', () => {
      console.log('Disconnected from MongoDB');
    });

    // Test the connection
    await mongoose.connection.db.admin().ping();
    console.log('MongoDB connection test successful');

  } catch (error) {
    console.error('Failed to connect to MongoDB:', {
      name: error.name,
      message: error.message,
      code: error.code,
      codeName: error.codeName,
      stack: error.stack
    });
    
    // Additional debugging information
    console.log('Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      MONGODB_URI_exists: !!process.env.MONGODB_URI,
      MONGO_URL_exists: !!process.env.MONGO_URL
    });
    
    throw error;
  }
};

module.exports = { connectDB }; 