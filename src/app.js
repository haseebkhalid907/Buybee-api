const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');
const httpStatus = require('http-status');
const config = require('./config/config');
const morgan = require('./config/morgan');
const { jwtStrategy } = require('./config/passport');
const { authLimiter } = require('./middlewares/rateLimiter');
const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');
const session = require('express-session');
const { setupCloudinary } = require('./config/cloudinary');

const app = express();

// Initialize Cloudinary
try {
  setupCloudinary();
} catch (error) {
  console.error('Error setting up Cloudinary:', error);
}

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// Special handling for Stripe webhooks to preserve raw body
app.use('/v1/payments/webhook',
  express.raw({ type: 'application/json' }),
  (req, res, next) => {
    try {
      // Store raw body for Stripe webhook verification
      req.rawBody = req.body;
      // Parse for our route handlers 
      if (req.body && req.body.toString) {
        req.body = JSON.parse(req.body.toString());
      }
      next();
    } catch (error) {
      next(new ApiError(httpStatus.BAD_REQUEST, 'Invalid JSON payload'));
    }
  }
);

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json({ limit: '10mb' }));

// parse urlencoded request body
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options('*', cors());

// Add a basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send({ status: 'ok', environment: config.env,status:"im_seeb" });
});

// Add serverless warmup endpoint (helps reduce cold starts)
app.get('/_warmup', (req, res) => {
  res.status(200).send('OK');
});

// session
app.use(
  session({
    secret: config.jwt.secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: config.env === 'production',
      httpOnly: true,
    },
  })
);

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// limit repeated failed requests to auth endpoints
if (config.env === 'production') {
  app.use('/v1/auth', authLimiter);
}

// v1 api routes
app.use('/v1', routes);

// Handle 404 routes
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;
