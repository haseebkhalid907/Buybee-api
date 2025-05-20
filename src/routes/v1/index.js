const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const docsRoute = require('./docs.route');
const productRoute = require('./product.route');
const orderRoute = require('./order.route');
const categoryRoute = require('./category.route');
const paymentRoute = require('./payment.route');
const exchangeAdRoute = require('./exchangeAd.route');
const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/products',
    route: productRoute
  },
  {
    path: '/orders',
    route: orderRoute
  },
  {
    path: '/categories',
    route: categoryRoute
  },
  {
    path: '/payments',
    route: paymentRoute
  },
  {
    path: '/exchange-ads',
    route: exchangeAdRoute
  }
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
