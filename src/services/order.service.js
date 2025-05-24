const httpStatus = require('http-status');
const { Order } = require('../models');
const ApiError = require('../utils/ApiError');

const createOrder = async (orderBody) => {
  return Order.create(orderBody);
};

const queryOrders = async (filter, options) => {
  // Create a copy of options to avoid modifying the original object
  const paginateOptions = { ...options };

  // Use an array of populate objects for more control over selection
  paginateOptions.populate = [
    { path: 'customer', select: 'name email' },
    { path: 'products.productId', select: 'name images price description category' },
    { path: 'items.product', select: 'name images price description category' },
    { path: 'items.seller', select: 'name storeName' }
  ];

  const orders = await Order.paginate(filter, paginateOptions);
  return orders;
};

const getOrderById = async (id) => {
  return Order.findById(id)
    .populate('customer', 'name email')
    .populate('products.productId', 'name images price description category')
    .populate('items.product', 'name images price description category')
    .populate('items.seller', 'name storeName');
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