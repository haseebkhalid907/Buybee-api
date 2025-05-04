const httpStatus = require('http-status');
const { Order } = require('../models');
const ApiError = require('../utils/ApiError');

const createOrder = async (orderBody) => {
  return Order.create(orderBody);
};

const queryOrders = async (filter, options) => {
  const orders = await Order.paginate(filter, options);
  return orders;
};

const getOrderById = async (id) => {
  return Order.findById(id);
};

/**
 * Get order by order number
 * @param {string} orderNumber
 * @returns {Promise<Order>}
 */
const getOrderByNumber = async (orderNumber) => {
  return Order.findOne({ orderNumber });
};

const updateOrderById = async (orderId, updateBody) => {
  const order = await getOrderById(orderId);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }
  Object.assign(order, updateBody);
  await order.save();
  return order;
};

const deleteOrderById = async (orderId) => {
  const order = await getOrderById(orderId);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }
  await order.remove();
  return order;
};

module.exports = {
  createOrder,
  queryOrders,
  getOrderById,
  getOrderByNumber,
  updateOrderById,
  deleteOrderById,
};