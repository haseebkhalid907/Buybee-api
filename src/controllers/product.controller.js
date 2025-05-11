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

  // If category is a string (name), handle the conversion
  // (This would require additional category fetching logic which is not implemented here)

  const product = await productService.createProduct({
    ...req.body,
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
    'featured'
  ]);
  if (filter.name) {
    filter.name = new RegExp(filter.name, 'i');
  }
  // Map categoryId to category field if provided
  if (filter.categoryId) {
    filter.category = filter.categoryId;
    delete filter.categoryId;
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
  const product = await productService.updateProductById(req.params.productId, req.body);
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