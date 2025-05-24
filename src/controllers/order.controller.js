const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { orderService } = require('../services');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_DUMMY_KEY');
const logger = require('../config/logger');

const createOrder = catchAsync(async (req, res) => {
  const order = await orderService.createOrder(req.body);
  res.status(httpStatus.CREATED).send(order);
});

const getOrders = catchAsync(async (req, res) => {
  const filter = pick(req.query, [
    'name',
    'status',
    'userId'
  ]);
  if (filter.name) {
    filter.name = new RegExp(filter.name, 'i');
  }

  // Handle date filtering
  const { startDate, endDate } = req.query;
  if (startDate || endDate) {
    filter.createdAt = {};

    if (startDate) {
      filter.createdAt.$gte = new Date(startDate);
    }

    if (endDate) {
      // Add 1 day to include the entire end date (up to 23:59:59)
      const endDateObj = new Date(endDate);
      endDateObj.setDate(endDateObj.getDate() + 1);
      filter.createdAt.$lt = endDateObj;
    }
  }

  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await orderService.queryOrders(filter, options);
  res.send(result);
});

const getOrder = catchAsync(async (req, res) => {
  const order = await orderService.getOrderById(req.params.orderId);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }
  res.send(order);
});

// Public endpoint to get minimal order details for payment flow
// This does not require authentication but requires client secret
const getOrderForPayment = catchAsync(async (req, res) => {
  const { orderId } = req.params;
  const { clientSecret } = req.query;

  // Validate that clientSecret is provided
  if (!clientSecret) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Client secret is required');
  }

  try {
    // Get order details
    const order = await orderService.getOrderById(orderId);

    if (!order) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
    }

    // Verify the client secret is valid for this order
    // This step verifies that the request is coming from a legitimate payment flow
    try {
      const paymentIntentId = clientSecret.split('_secret_')[0];
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      // Verify that the payment intent is for this order
      if (paymentIntent.metadata?.orderNumber !== order.orderNumber) {
        logger.warn(`Payment intent ${paymentIntentId} is not for order ${order.orderNumber}`);
        throw new ApiError(httpStatus.FORBIDDEN, 'Invalid client secret for this order');
      }
    } catch (err) {
      // If we can't verify with Stripe (e.g., invalid secret), return minimal info
      // This is just for better UX - still provide basic order info when possible
      logger.error('Error verifying payment intent:', err);
      return res.send({
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        status: order.status
      });
    }

    // Return limited order details for payment flow
    res.send({
      id: order._id,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      status: order.status,
      paymentStatus: order.paymentStatus,
      firstName: order.firstName,
      lastName: order.lastName,
      email: order.email,
    });
  } catch (error) {
    logger.error('Error accessing order for payment:', error);
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }
});

const updateOrder = catchAsync(async (req, res) => {
  const order = await orderService.updateOrderById(req.params.orderId, req.body);
  res.send(order);
});

const deleteOrder = catchAsync(async (req, res) => {
  await orderService.deleteOrderById(req.params.orderId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createOrder,
  getOrders,
  getOrder,
  getOrderForPayment,
  updateOrder,
  deleteOrder,
};