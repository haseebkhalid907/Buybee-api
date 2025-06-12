/**
 * This script can help diagnose issues with your Vercel deployment
 * 
 * Usage: 
 * - Local testing: node scripts/vercel-debug.js
 * - You can also deploy this file separately to test basic connectivity
 */

const http = require('http');
const os = require('os');
const mongoose = require('mongoose');

// Simple Express-like handler for testing
async function handler(req, res) {
  try {
    // Basic info about the environment
    const info = {
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      memoryUsage: process.memoryUsage(),
      cpus: os.cpus().length,
      freeMemory: os.freemem(),
      totalMemory: os.totalmem(),
      uptime: os.uptime(),
      env: {
        nodeEnv: process.env.NODE_ENV,
        isVercel: !!process.env.VERCEL,
        region: process.env.VERCEL_REGION || 'unknown'
      },
      headers: req.headers,
    };
    
    // Test MongoDB connection if URL is available
    if (process.env.MONGODB_URL) {
      try {
        await mongoose.connect(process.env.MONGODB_URL, {
          useNewUrlParser: true,
          useUnifiedTopology: true
        });
        info.mongodb = 'Connected successfully';
        
        // Get connection stats
        const adminDb = mongoose.connection.db.admin();
        const serverStatus = await adminDb.serverStatus();
        info.mongodbStatus = {
          connections: serverStatus.connections,
          uptime: serverStatus.uptime,
          version: serverStatus.version
        };
        
        await mongoose.disconnect();
      } catch (dbError) {
        info.mongodb = 'Connection failed';
        info.mongodbError = dbError.message;
      }
    } else {
      info.mongodb = 'No MONGODB_URL environment variable found';
    }
    
    // Return all info
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(info, null, 2));
    
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      error: error.message, 
      stack: error.stack 
    }));
  }
}

// If running directly (not imported)
if (require.main === module) {
  // Create basic server
  const server = http.createServer(handler);
  const PORT = process.env.PORT || 3000;
  
  server.listen(PORT, () => {
    console.log(`Debug server running at http://localhost:${PORT}`);
  });
}

// Export for serverless
module.exports = handler;
