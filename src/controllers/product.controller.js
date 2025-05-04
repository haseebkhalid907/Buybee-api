const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { productService } = require('../services');
const pick = require('../utils/pick');

// const createProduct = catchAsync(async (req, res) => {
//   const product = await productService.createProduct({...req.body, userId: req?.user?.id ? req.user.id : req?.user?._id});
//   res.status(httpStatus.CREATED).send(product);
// });


const createProduct = catchAsync(async (req, res) => {
  const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

  const product = await productService.createProduct({
    ...req.body,
    userId: req.user.id || req.user._id,
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