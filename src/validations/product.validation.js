const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createProduct = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    price: Joi.number().required(),
    description: Joi.string().required(),
    category: Joi.string().required(),
    stock: Joi.number().required(),
    images: Joi.array().items(Joi.string().trim()),
    size: Joi.string().required(),
    colors: Joi.string().required(),
    rating: Joi.number().required(),
    featured: Joi.boolean(),
    isFavorite: Joi.boolean(),
    type: Joi.string().valid('new', 'used').required(),
    // Add new optional fields to validation
    brand: Joi.string().allow('', null),
    condition: Joi.string().valid('new', 'like-new', 'good', 'fair', 'poor'),
    exchangeable: Joi.string().allow('', null),
    location: Joi.string().allow('', null),
    userId: Joi.string().custom(objectId),
    // Add boost fields validation
    boost: Joi.object().keys({
      active: Joi.boolean(),
      package: Joi.string().valid('package1', 'package2', 'package3', 'custom'),
      cost: Joi.number().min(0),
      days: Joi.number().min(1),
      startDate: Joi.date().iso(),
      endDate: Joi.date().iso(),
      paymentDetails: Joi.object().keys({
        cardLastFour: Joi.string(),
        expiryDate: Joi.string(),
        transactionId: Joi.string(),
        paymentDate: Joi.date().iso(),
        paymentStatus: Joi.string() // Adding paymentStatus field
      })
    }),
  }),
};

const getProducts = {
  query: Joi.object().keys({
    name: Joi.string(),
    category: Joi.string(),
    categoryId: Joi.string().custom(objectId),
    type: Joi.string(),
    featured: Joi.boolean(),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getProduct = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId),
  }),
};

const updateProduct = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      userId: Joi.string().custom(objectId),
      name: Joi.string(),
      price: Joi.number(),
      description: Joi.string(),
      category: Joi.string(),
      stock: Joi.number(),
      images: Joi.array().items(Joi.string().trim()),
      size: Joi.string(),
      colors: Joi.string(),
      rating: Joi.number(),
      featured: Joi.boolean(),
      isFavorite: Joi.boolean(),
      type: Joi.string().valid('new', 'used'),
      // Add new optional fields to update validation
      brand: Joi.string().allow('', null),
      condition: Joi.string().valid('new', 'like-new', 'good', 'fair', 'poor'),
      exchangeable: Joi.string().allow('', null),
      location: Joi.string().allow('', null),
      // Add boost fields validation for update
      boost: Joi.object().keys({
        active: Joi.boolean(),
        package: Joi.string().valid('package1', 'package2', 'package3', 'custom'),
        cost: Joi.number().min(0),
        days: Joi.number().min(1),
        startDate: Joi.date().iso(),
        endDate: Joi.date().iso(),
        paymentDetails: Joi.object().keys({
          cardLastFour: Joi.string(),
          expiryDate: Joi.string(),
          transactionId: Joi.string(),
          paymentDate: Joi.date().iso(),
          paymentStatus: Joi.string() // Adding paymentStatus field
        })
      }),
    })
    .min(1),
};

const deleteProduct = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
};