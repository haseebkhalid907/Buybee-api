const httpStatus = require('http-status');
const { Product } = require('../models');
const ApiError = require('../utils/ApiError');

const createProduct = async (productBody) => {
  return Product.create(productBody);
};

const queryProducts = async (filter, options) => {
  // Handle populate option
  const populateOptions = { ...options };
  
  // If populate option is provided, add it to the options
  if (options.populate) {
    populateOptions.populate = options.populate;
  }
  
  const products = await Product.paginate(filter, populateOptions);
  return products;
};

const getProductById = async (id, options = {}) => {
  let query = Product.findById(id);
  
  // If populate option is provided, add it to the query
  if (options.populate) {
    if (typeof options.populate === 'string') {
      options.populate.split(',').forEach((field) => {
        query = query.populate(field);
      });
    }
  }
  
  return query.exec();
};

const updateProductById = async (productId, updateBody) => {
  const product = await getProductById(productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }

  // Handle stock updates specifically to prevent NaN values
  if ('stock' in updateBody) {
    // Ensure stock is a valid number
    const newStock = Number(updateBody.stock);
    if (isNaN(newStock)) {
      // If stock value is invalid, use current stock or default to 0
      updateBody.stock = product.stock || 0;
    } else {
      // Ensure stock is non-negative
      updateBody.stock = Math.max(0, newStock);
    }
  }

  Object.assign(product, updateBody);
  await product.save();
  return product;
};

const deleteProductById = async (productId) => {
  const product = await getProductById(productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  await product.remove();
  return product;
};

module.exports = {
  createProduct,
  queryProducts,
  getProductById,
  updateProductById,
  deleteProductById,
};