
/**
 * Simple health check endpoint for Vercel
 * 
 * This can be deployed as a separate serverless function
 * to verify basic functionality without loading the entire app
 */

const mongoose = require('mongoose');
const os = require('os');

// Health check function for Vercel
module.exports = async (req, res) => {
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: {
      node: process.version,
      platform: process.platform,
      memory: Math.round(process.memoryUsage().rss / 1024 / 1024) + 'MB',
      serverless: true
    }
  };

  // Check MongoDB connection if URL exists
  if (process.env.MONGODB_URL) {
    try {
      const connection = await mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000  // Timeout after 5s instead of default 30s
      });
      
      healthData.database = {
        status: 'connected',
        name: connection.connection.name
      };
      
      await mongoose.disconnect();
    } catch (error) {
      healthData.database = {
        status: 'error',
        message: error.message
      };
    }
  } else {
    healthData.database = {
      status: 'not_configured',
      message: 'MONGODB_URL environment variable not set'
    };
  }

  // Return health data with appropriate status code
  const statusCode = healthData.database?.status === 'error' ? 500 : 200;
  
  res.status(statusCode).json(healthData);
};
