const httpStatus = require('http-status');
const { ExchangeAd, Category } = require('../models');
const ApiError = require('../utils/ApiError');
const { getUserById } = require('./user.service');
const mongoose = require('mongoose');

/**
 * Create an exchange ad
 * @param {Object} adBody
 * @param {String} userId
 * @returns {Promise<ExchangeAd>}
 */
const createExchangeAd = async (adBody, userId) => {
    // Verify user exists
    await getUserById(userId);

    // If category exists but categoryName is missing, try to fetch it
    if (adBody.category && !adBody.categoryName && mongoose.Types.ObjectId.isValid(adBody.category)) {
        try {
            const category = await Category.findById(adBody.category);
            if (category) {
                adBody.categoryName = category.name;
            }
        } catch (error) {
            // Continue without categoryName if lookup fails
            console.log("Could not fetch category name:", error.message);
        }
    }

    // Set a default categoryName if still missing
    if (!adBody.categoryName) {
        adBody.categoryName = adBody.category ? `Category ${adBody.category}` : 'Uncategorized';
    }

    return ExchangeAd.create({ ...adBody, user: userId });
};

/**
 * Query for exchange ads with pagination and filtering
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryExchangeAds = async (filter, options) => {
    // Handle price range filtering if provided
    const filterCopy = { ...filter };

    if (filter.minPrice || filter.maxPrice) {
        filterCopy.price = {};
        if (filter.minPrice) filterCopy.price.$gte = filter.minPrice;
        if (filter.maxPrice) filterCopy.price.$lte = filter.maxPrice;

        delete filterCopy.minPrice;
        delete filterCopy.maxPrice;
    }

    const ads = await ExchangeAd.paginate(filterCopy, options);
    return ads;
};

/**
 * Get exchange ad by id
 * @param {ObjectId} id
 * @returns {Promise<ExchangeAd>}
 */
const getExchangeAdById = async (id) => {
    const ad = await ExchangeAd.findById(id).populate('user', 'name email phone');
    if (!ad) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Exchange ad not found');
    }
    return ad;
};

/**
 * Update exchange ad by id
 * @param {ObjectId} exchangeAdId
 * @param {Object} updateBody
 * @param {String} userId - ID of the user making the update
 * @returns {Promise<ExchangeAd>}
 */
const updateExchangeAdById = async (exchangeAdId, updateBody, userId) => {
    const ad = await getExchangeAdById(exchangeAdId);

    // Check if user is the owner of the ad (if user field exists)
    if (ad.user && ad.user._id && ad.user._id.toString() !== userId) {
        throw new ApiError(httpStatus.FORBIDDEN, 'You are not authorized to update this ad');
    }
    
    // If user field doesn't exist in the schema, skip ownership check
    // This is a temporary workaround until the user field is properly added to the schema
    if (!ad.user) {
        console.log('Warning: User ownership check skipped due to missing user field in exchange ad schema');
    }

    Object.assign(ad, updateBody);
    await ad.save();
    return ad;
};

/**
 * Delete exchange ad by id
 * @param {ObjectId} exchangeAdId
 * @param {String} userId - ID of the user making the deletion
 * @returns {Promise<ExchangeAd>}
 */
const deleteExchangeAdById = async (exchangeAdId, userId) => {
    const ad = await getExchangeAdById(exchangeAdId);

    // Check if user is the owner of the ad (if user field exists)
    if (ad.user && ad.user._id && ad.user._id.toString() !== userId) {
        throw new ApiError(httpStatus.FORBIDDEN, 'You are not authorized to delete this ad');
    }
    
    // If user field doesn't exist in the schema, skip ownership check
    // This is a temporary workaround until the user field is properly added to the schema
    if (!ad.user) {
        console.log('Warning: User ownership check skipped due to missing user field in exchange ad schema');
    }

    await ad.deleteOne();
    return ad;
};

/**
 * Get exchange ads by user id with pagination and filtering
 * @param {ObjectId} userId
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const getExchangeAdsByUserId = async (userId, filter, options) => {
    // Check if user exists
    await getUserById(userId);

    return ExchangeAd.paginate({ ...filter, user: userId }, options);
};

/**
 * Boost an exchange ad (increases visibility)
 * @param {ObjectId} exchangeAdId
 * @param {Number} days - Number of days to boost the ad
 * @param {String} userId - ID of the user performing the boost
 * @returns {Promise<ExchangeAd>}
 */
const boostExchangeAd = async (exchangeAdId, days, userId) => {
    const ad = await getExchangeAdById(exchangeAdId);

    // Check if user is the owner of the ad
    if (ad.user._id.toString() !== userId) {
        throw new ApiError(httpStatus.FORBIDDEN, 'You are not authorized to boost this ad');
    }

    // Set the boosted status and calculate expiry date
    const currentDate = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(currentDate.getDate() + days);

    ad.isBoosted = true;
    ad.boostExpiry = expiryDate;

    await ad.save();
    return ad;
};

/**
 * Toggle favorite status for an exchange ad
 * @param {ObjectId} exchangeAdId
 * @returns {Promise<ExchangeAd>}
 */
const toggleFavoriteExchangeAd = async (exchangeAdId) => {
    const ad = await getExchangeAdById(exchangeAdId);
    ad.favorites = (ad.favorites || 0) + 1;
    await ad.save();
    return ad;
};

/**
 * Search exchange ads by keyword
 * @param {String} keyword - Search keyword
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const searchExchangeAds = async (keyword, options) => {
    const searchQuery = {
        $or: [
            { name: { $regex: keyword, $options: 'i' } },
            { description: { $regex: keyword, $options: 'i' } },
            { brand: { $regex: keyword, $options: 'i' } },
            { categoryName: { $regex: keyword, $options: 'i' } },
        ],
        isActive: true,
    };

    return ExchangeAd.paginate(searchQuery, options);
};

module.exports = {
    createExchangeAd,
    queryExchangeAds,
    getExchangeAdById,
    updateExchangeAdById,
    deleteExchangeAdById,
    getExchangeAdsByUserId,
    boostExchangeAd,
    toggleFavoriteExchangeAd,
    searchExchangeAds,
};