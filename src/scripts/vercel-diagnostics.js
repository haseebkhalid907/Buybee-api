/**
 * This script helps debug Vercel deployment issues by providing detailed diagnostics
 * It can be run locally or as part of a Vercel deployment
 */

const mongoose = require('mongoose');
const fs = require('fs').promises;
const os = require('os');

// Export a handler function that can be called directly or used in serverless
async function diagnose(req, res) {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {
      platform: process.platform,
      nodeVersion: process.version,
      memoryUsage: process.memoryUsage(),
      cpus: os.cpus().length,
      totalMemory: Math.round(os.totalmem() / (1024 * 1024)) + ' MB',
      freeMemory: Math.round(os.freemem() / (1024 * 1024)) + ' MB',
      serverlessMode: !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME),
      env: {
        NODE_ENV: process.env.NODE_ENV || 'not set',
        VERCEL: process.env.VERCEL || 'not set',
        VERCEL_REGION: process.env.VERCEL_REGION || 'not set',
      }
    },
    mongodb: {
      status: 'unknown',
      error: null
    },
    filesystemCheck: {
      status: 'unknown',
      error: null,
      tempFileWritable: false
    }
  };

  // Check MongoDB connectivity
  if (process.env.MONGODB_URL) {
    try {
      await mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000, // Timeout after 5s
      });
      
      diagnostics.mongodb.status = 'connected';
      
      // Check if we can query
      const collections = await mongoose.connection.db.listCollections().toArray();
      diagnostics.mongodb.collections = collections.map(c => c.name).slice(0, 5); // Just list first 5
      
      await mongoose.disconnect();
    } catch (error) {
      diagnostics.mongodb.status = 'error';
      diagnostics.mongodb.error = error.message;
    }
  } else {
    diagnostics.mongodb.status = 'no connection string';
  }

  // Check filesystem access (important for Vercel)
  try {
    const tempFilePath = `/tmp/buybee-test-${Date.now()}.txt`;
    await fs.writeFile(tempFilePath, 'Test file for Buybee API diagnostics');
    await fs.unlink(tempFilePath);
    diagnostics.filesystemCheck.status = 'ok';
    diagnostics.filesystemCheck.tempFileWritable = true;
  } catch (error) {
    diagnostics.filesystemCheck.status = 'error';
    diagnostics.filesystemCheck.error = error.message;
  }
  
  // Check environment variables (redacting sensitive ones)
  diagnostics.environmentVariables = Object.keys(process.env)
    .filter(key => !key.includes('SECRET') && !key.includes('PASSWORD') && !key.includes('KEY'))
    .sort()
    .slice(0, 20); // Just list first 20 non-sensitive env vars
  
  // Return diagnostics
  if (res) {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify(diagnostics, null, 2));
  }
  
  return diagnostics;
}

// If run directly, start a server
if (require.main === module) {
  const http = require('http');
  const PORT = process.env.DIAG_PORT || 3030; // Use a different port to avoid conflicts
  
  // Try to run diagnostics directly and print to console if not running in a server
  if (process.argv.includes('--console')) {
    diagnose().then(results => {
      console.log(JSON.stringify(results, null, 2));
    }).catch(err => {
      console.error('Diagnostics failed:', err);
      process.exit(1);
    });
  } else {
    const server = http.createServer(async (req, res) => {
      if (req.url === '/diagnostics') {
        await diagnose(req, res);
      } else {
        res.statusCode = 200;
        res.end('Visit /diagnostics for diagnostic information');
      }
    });
    
    server.listen(PORT, () => {
      console.log(`Diagnostic server running at http://localhost:${PORT}/diagnostics`);
    });
  }
}

module.exports = diagnose;
