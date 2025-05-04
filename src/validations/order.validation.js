const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createOrder = {
  body: Joi.object().keys({
    userId: Joi.string().custom(objectId).required(),
    products: Joi.array().items(
      Joi.object().keys({
        productId: Joi.string().custom(objectId).required(),
        quantity: Joi.number().min(1).required(),
        price: Joi.number().required(),
      })
    ).required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    phone: Joi.number().required(),
    email: Joi.string().required().email(),
    totalAmount: Joi.number().required(),
    shippingAddress: Joi.string().required(),
    billingAddress: Joi.string().required(),
    postalCode: Joi.number(),
    city: Joi.string().required(),
    country: Joi.string().required(),
    deliveryDate: Joi.date().required(),
    shippingCharges: Joi.number().required(),
    gstApplicable: Joi.boolean(),
    gst: Joi.number(),
    paymentMethod: Joi.string().valid('credit_card', 'paypal', 'bank_transfer', 'cash').required(),
    status: Joi.string().valid('pending', 'paid', 'shipped', 'delivered', 'cancelled'),
  }),
};

const getOrders = {
  query: Joi.object().keys({
    userId: Joi.string().custom(objectId),
    status: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getOrder = {
  params: Joi.object().keys({
    orderId: Joi.string().custom(objectId),
  }),
};

const updateOrder = {
  params: Joi.object().keys({
    orderId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      userId: Joi.string().custom(objectId),
      products: Joi.array().items(
        Joi.object().keys({
          productId: Joi.string().custom(objectId),
          quantity: Joi.number().min(1),
          price: Joi.number(),
        })
      ),
      firstName: Joi.string(),
      lastName: Joi.string(),
      phone: Joi.number(),
      email: Joi.string().email(),
      totalAmount: Joi.number(),
      shippingAddress: Joi.string(),
      billingAddress: Joi.string(),
      postalCode: Joi.number(),
      city: Joi.string(),
      country: Joi.string(),
      deliveryDate: Joi.date(),
      shippingCharges: Joi.number(),
      gstApplicable: Joi.boolean(),
      gst: Joi.number(),
      paymentMethod: Joi.string().valid('credit_card', 'paypal', 'bank_transfer', 'cash'),
      status: Joi.string().valid('pending', 'paid', 'shipped', 'delivered', 'cancelled'),
    })
    .min(1),
};

const deleteOrder = {
  params: Joi.object().keys({
    orderId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createOrder,
  getOrders,
  getOrder,
  updateOrder,
  deleteOrder,
};