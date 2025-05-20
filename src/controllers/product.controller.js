const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { productService } = require('../services');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');

// const createProduct = catchAsync(async (req, res) => {
//   const product = await productService.createProduct({...req.body, userId: req?.user?.id ? req.user.id : req?.user?._id});
//   res.status(httpStatus.CREATED).send(product);
// });


const createProduct = catchAsync(async (req, res) => {
  const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

  // Check if user is authenticated
  if (!req.user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'User must be authenticated to create products');
  }

  // Set the seller field to the current user's ID
  const sellerId = req.user.id || req.user._id;

  // Handle flattened boost properties for multipart form data
  // Check if we have boost properties in the flattened format
  const requestBody = { ...req.body };

  if (
    requestBody.boost_active !== undefined ||
    requestBody.boost_package !== undefined ||
    requestBody.boost_cost !== undefined ||
    requestBody.boost_days !== undefined ||
    requestBody.boost_startDate !== undefined ||
    requestBody.boost_endDate !== undefined ||
    requestBody.boost_paymentDetails !== undefined
  ) {
    // Create boost object structure
    requestBody.boost = {
      active: requestBody.boost_active === 'true' || requestBody.boost_active === true,
      package: requestBody.boost_package || 'custom',
      cost: Number(requestBody.boost_cost) || 0,
      days: Number(requestBody.boost_days) || 0,
      startDate: requestBody.boost_startDate || new Date().toISOString(),
      endDate: requestBody.boost_endDate || new Date().toISOString()
    };

    // Parse payment details if present as string
    if (requestBody.boost_paymentDetails) {
      try {
        requestBody.boost.paymentDetails = JSON.parse(requestBody.boost_paymentDetails);
      } catch (err) {
        console.error('Error parsing boost payment details:', err);
        requestBody.boost.paymentDetails = {};
      }
    }

    // Remove flattened properties
    delete requestBody.boost_active;
    delete requestBody.boost_package;
    delete requestBody.boost_cost;
    delete requestBody.boost_days;
    delete requestBody.boost_startDate;
    delete requestBody.boost_endDate;
    delete requestBody.boost_paymentDetails;
  }

  const product = await productService.createProduct({
    ...requestBody,
    userId: sellerId, // For tracking 
    seller: sellerId, // Required field in the product model
    images,
  });

  res.status(httpStatus.CREATED).send(product);
});

const getProducts = catchAsync(async (req, res) => {
  const filter = pick(req.query, [
    'name',
    'category',
    'categoryId',
    'type',
    'featured',
    'startDate',
    'endDate'
  ]);
  if (filter.name) {
    filter.name = new RegExp(filter.name, 'i');
  }
  // Map categoryId to category field if provided
  if (filter.categoryId) {
    filter.category = filter.categoryId;
    delete filter.categoryId;
  }

  // Handle date range filtering
  if (filter.startDate || filter.endDate) {
    filter.createdAt = {};
    if (filter.startDate) {
      filter.createdAt.$gte = new Date(filter.startDate);
      delete filter.startDate;
    }
    if (filter.endDate) {
      filter.createdAt.$lte = new Date(filter.endDate);
      delete filter.endDate;
    }
  }

  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await productService.queryProducts(filter, options);
  res.send(result);
});

const getUserProducts = catchAsync(async (req, res) => {
  const filter = pick(req.query, [
    'name',
    'category',
    'type'
  ]);
  // filter.scrapedBy = { $in: req.user.id };
  filter.userId = req?.user?.id ? req.user.id : req?.user?._id;
  if (filter.name) {
    filter.name = new RegExp(filter.name, 'i');
  }
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await productService.queryProducts(filter, options);
  res.send(result);
});

const getProduct = catchAsync(async (req, res) => {
  const product = await productService.getProductById(req.params.productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  res.send(product);
});

const updateProduct = catchAsync(async (req, res) => {
  // Handle flattened boost properties for multipart form data
  const requestBody = { ...req.body };

  if (
    requestBody.boost_active !== undefined ||
    requestBody.boost_package !== undefined ||
    requestBody.boost_cost !== undefined ||
    requestBody.boost_days !== undefined ||
    requestBody.boost_startDate !== undefined ||
    requestBody.boost_endDate !== undefined ||
    requestBody.boost_paymentDetails !== undefined
  ) {
    // Create boost object structure
    requestBody.boost = {
      active: requestBody.boost_active === 'true' || requestBody.boost_active === true,
      package: requestBody.boost_package || 'custom',
      cost: Number(requestBody.boost_cost) || 0,
      days: Number(requestBody.boost_days) || 0,
      startDate: requestBody.boost_startDate || new Date().toISOString(),
      endDate: requestBody.boost_endDate || new Date().toISOString()
    };

    // Parse payment details if present as string
    if (requestBody.boost_paymentDetails) {
      try {
        requestBody.boost.paymentDetails = JSON.parse(requestBody.boost_paymentDetails);
      } catch (err) {
        console.error('Error parsing boost payment details:', err);
        requestBody.boost.paymentDetails = {};
      }
    }

    // Remove flattened properties
    delete requestBody.boost_active;
    delete requestBody.boost_package;
    delete requestBody.boost_cost;
    delete requestBody.boost_days;
    delete requestBody.boost_startDate;
    delete requestBody.boost_endDate;
    delete requestBody.boost_paymentDetails;
  }

  const product = await productService.updateProductById(req.params.productId, requestBody);
  res.send(product);
});

const deleteProduct = catchAsync(async (req, res) => {
  await productService.deleteProductById(req.params.productId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getUserProducts
};