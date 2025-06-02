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
setupCloudinary();

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// Special handling for Stripe webhooks to preserve raw body
app.use('/v1/payments/webhook',
  express.raw({ type: 'application/json' }),
  (req, res, next) => {
    // Store raw body for Stripe webhook verification
    req.rawBody = req.body;
    // Parse for our route handlers 
    if (req.body && req.body.toString) {
      req.body = JSON.parse(req.body.toString());
    }
    next();
  }
);

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options('*', cors());

// jwt authentication
app.use(passport.initialize());
// Remove passport.session() as we're using stateless JWT authentication

passport.use('jwt', jwtStrategy);

// limit repeated failed requests to auth endpoints
if (config.env === 'production') {
  app.use('/v1/auth', authLimiter);
}

// v1 api routes
app.use('/v1', routes);
// make static route for check servce is up
app.get('/v1/health', (req, res) => {
  res.status(httpStatus.OK).send({ message: 'Service is up and running' });
});

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;
