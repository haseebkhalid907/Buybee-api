const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createProduct = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    price: Joi.number().required(),
    description: Joi.string().required(),
    category: Joi.string().custom(objectId).required(), // Should be ObjectId, not string
    stock: Joi.number().required(),
    images: Joi.array().items(Joi.string().trim()).min(0), // Allow empty for testing
    condition: Joi.string().valid('new', 'like-new', 'good', 'fair', 'poor').required(), // Required field
    // Optional fields - remove required from size, colors, rating
    size: Joi.string().allow('', null),
    colors: Joi.string().allow('', null),
    type: Joi.string().valid('new', 'used').default('new'),
    rating: Joi.object().keys({
      average: Joi.number().min(0).max(5).default(0),
      count: Joi.number().min(0).default(0)
    }),
    featured: Joi.boolean(),
    isFavorite: Joi.boolean(),
    type: Joi.string().valid('new', 'used'),
    // Add new optional fields to validation
    brand: Joi.string().allow('', null),
    exchangeable: Joi.string().allow('', null),
    location: Joi.string().allow('', null),
    userId: Joi.string().custom(objectId),
    seller: Joi.string().custom(objectId), // Add seller field
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
        paymentStatus: Joi.string(), // Payment status field
        stripeVerified: Joi.boolean() // Adding stripeVerified field to validation
      })
    }),
    // Add missing fields for comprehensive product creation
    variationStock: Joi.object().pattern(
      Joi.string(),
      Joi.object().keys({
        quantity: Joi.string().allow(''),
        available: Joi.string().allow(''),
        reserved: Joi.string().allow(''),
        sold: Joi.string().allow('')
      })
    ),
    discount: Joi.object().keys({
      percentage: Joi.number().min(0).max(100).default(0),
      active: Joi.boolean().default(false),
      startDate: Joi.date().iso().allow(null),
      endDate: Joi.date().iso().allow(null)
    }),
    shipping: Joi.object().keys({
      free: Joi.boolean().default(false),
      cost: Joi.number().min(0).default(0)
    }),
    specifications: Joi.object().pattern(Joi.string(), Joi.string()),
    tags: Joi.array().items(Joi.string().trim()),
    weight: Joi.object().keys({
      value: Joi.number().min(0),
      unit: Joi.string().valid('kg', 'lb').default('kg')
    }),
    dimensions: Joi.object().keys({
      length: Joi.number().min(0),
      width: Joi.number().min(0),
      height: Joi.number().min(0),
      unit: Joi.string().valid('cm', 'in').default('cm')
    }),
    views: Joi.number().min(0).default(0),
    status: Joi.string().valid('active', 'inactive', 'deleted').default('active'),
  }),
};

const getProducts = {
  query: Joi.object().keys({
    name: Joi.string(),
    search: Joi.string(), // Add search parameter
    category: Joi.string(),
    categoryId: Joi.string().custom(objectId),
    type: Joi.string(),
    featured: Joi.boolean(),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    populate: Joi.string(), // Adding populate parameter to allow category population
  }),
};

const getProduct = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId),
  }),
  query: Joi.object().keys({
    populate: Joi.string(), // Allow populate parameter in the query
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
          paymentStatus: Joi.string(), // Adding paymentStatus field
          stripeVerified: Joi.boolean() // Adding stripeVerified field to validation
        })
      }),
      // Add missing fields for comprehensive product updates
      variationStock: Joi.object().pattern(
        Joi.string(),
        Joi.object().keys({
          quantity: Joi.string().allow(''),
          available: Joi.string().allow(''),
          reserved: Joi.string().allow(''),
          sold: Joi.string().allow('')
        })
      ),
      discount: Joi.object().keys({
        percentage: Joi.number().min(0).max(100),
        active: Joi.boolean(),
        startDate: Joi.date().iso().allow(null),
        endDate: Joi.date().iso().allow(null)
      }),
      shipping: Joi.object().keys({
        free: Joi.boolean(),
        cost: Joi.number().min(0)
      }),
      specifications: Joi.object().pattern(Joi.string(), Joi.string()),
      tags: Joi.array().items(Joi.string().trim()),
      weight: Joi.object().keys({
        value: Joi.number().min(0),
        unit: Joi.string().valid('kg', 'lb')
      }),
      dimensions: Joi.object().keys({
        length: Joi.number().min(0),
        width: Joi.number().min(0),
        height: Joi.number().min(0),
        unit: Joi.string().valid('cm', 'in')
      }),
      views: Joi.number().min(0),
      status: Joi.string().valid('active', 'inactive', 'deleted'),
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