const mongoose = require('mongoose');
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');

// Check if we're in a serverless environment (Vercel)
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

// Connect to MongoDB
mongoose.connect(config.mongoose.url, config.mongoose.options)
  .then(() => {
    logger.info('Connected to MongoDB');
    
    if (!isServerless) {
      // Only create server with WebSockets if not in serverless environment
      const http = require('http');
      const WebSocket = require('ws');
      
      // Create HTTP server
      const server = http.createServer(app);

      // Create WebSocket server
      const wss = new WebSocket.Server({ server, path: '/ws' });

      wss.on('connection', (ws) => {
        logger.info('WebSocket client connected');

        ws.on('message', (message) => {
          logger.info(`Received message: ${message}`);
          // Handle incoming messages
          try {
            const data = JSON.parse(message);
            // Process data based on your application needs
          } catch (error) {
            logger.error('Error processing WebSocket message:', error);
          }
        });

        ws.on('close', () => {
          logger.info('WebSocket client disconnected');
        });

        // Send a welcome message
        ws.send(JSON.stringify({ type: 'connection', message: 'Connected to Buybee API WebSocket server' }));
      });

      // Start the server
      server.listen(config.port, () => {
        logger.info(`Listening to port ${config.port}`);
        logger.info(`WebSocket server running at ws://localhost:${config.port}/ws`);
      });
      
      // Handle graceful shutdown
      const exitHandler = () => {
        if (server) {
          server.close(() => {
            logger.info('Server closed');
            process.exit(1);
          });
        } else {
          process.exit(1);
        }
      };

      const unexpectedErrorHandler = (error) => {
        logger.error(error);
        exitHandler();
      };

      process.on('uncaughtException', unexpectedErrorHandler);
      process.on('unhandledRejection', unexpectedErrorHandler);

      process.on('SIGTERM', () => {
        logger.info('SIGTERM received');
        if (server) {
          server.close();
        }
      });
    } else {
      // In serverless environment, we don't need to explicitly start a server
      logger.info('Running in serverless mode');
    }
  })
  .catch((err) => {
    logger.error('Failed to connect to MongoDB', err);
  });

// Export the Express app for serverless environments
module.exports = app;
