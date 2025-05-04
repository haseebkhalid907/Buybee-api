const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { Seller } = require('../models');

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createSeller = async (userBody) => {
  return Seller.create(userBody);
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const querySellers = async (filter, options) => {
  const users = await Seller.paginate(filter, options);
  return users;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<Seller>}
 */
const getSellerById = async (id) => {
  return Seller.findById(id);
};


/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<Seller>}
 */
const updateSellerById = async (selelrId, updateBody) => {
  const user = await getSellerById(selelrId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Seller not found');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<Seller>}
 */
const deleteSelelerById = async (sellerId) => {
  const user = await getSellerById(sellerId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Seller not found');
  }
  await user.remove();
  return user;
};

module.exports = {
  createSeller,
  querySellers,
  getSellerById,
  updateSellerById,
  deleteSelelerById,
};
