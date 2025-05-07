const mongoose = require('mongoose');
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');
const http = require('http');
const WebSocket = require('ws');

let server;
mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
  logger.info('Connected to MongoDB');

  // Create HTTP server
  server = http.createServer(app);

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
        // For example, handle chat messages, notifications, etc.
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
});

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
