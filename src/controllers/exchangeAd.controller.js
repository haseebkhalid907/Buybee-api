const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { exchangeAdService } = require('../services');

/**
 * Create a new exchange ad
 */
const createExchangeAd = catchAsync(async (req, res) => {
    const ad = await exchangeAdService.createExchangeAd(req.body
        // , req.user.id
    );
    res.status(httpStatus.CREATED).send(ad);
});

/**
 * Get all exchange ads with pagination and filtering
 */
const getExchangeAds = catchAsync(async (req, res) => {
    // console.log("🚀 ~ getExchangeAds ~ req.user:", req.user)
    // console.log("🚀 ~ getExchangeAds ~ req.auth:", req.auth)
    const filter = pick(req.query, [
        'name', 'brand', 'condition', 'category',
        'exchangeType', 'minPrice', 'maxPrice',
        'location', 'status', 'isActive'
    ]);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await exchangeAdService.queryExchangeAds(filter, options);
    console.log("🚀 ~ getExchangeAds ~ result:", result)
    res.send(result);
});

/**
 * Get a single exchange ad by ID
 */
const getExchangeAd = catchAsync(async (req, res) => {
    const ad = await exchangeAdService.getExchangeAdById(req.params.exchangeAdId);
    res.send(ad);
});

/**
 * Update an exchange ad
 */
const updateExchangeAd = catchAsync(async (req, res) => {
    const ad = await exchangeAdService.updateExchangeAdById(req.params.exchangeAdId, req.body, req.user.id);
    res.send(ad);
});

/**
 * Delete an exchange ad
 */
const deleteExchangeAd = catchAsync(async (req, res) => {
    await exchangeAdService.deleteExchangeAdById(req.params.exchangeAdId, req.user.id);
    res.status(httpStatus.NO_CONTENT).send();
});

/**
 * Get all exchange ads by a specific user
 */
const getUserExchangeAds = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['condition', 'category', 'exchangeType', 'status', 'isActive']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await exchangeAdService.getExchangeAdsByUserId(req.params.userId, filter, options);
    res.send(result);
});

/**
 * Boost an exchange ad
 */
const boostExchangeAd = catchAsync(async (req, res) => {
    const ad = await exchangeAdService.boostExchangeAd(
        req.params.exchangeAdId,
        req.body.days || 7,
        req.user.id
    );
    res.send(ad);
});

/**
 * Toggle favorite status for an exchange ad
 */
const toggleFavoriteExchangeAd = catchAsync(async (req, res) => {
    const ad = await exchangeAdService.toggleFavoriteExchangeAd(req.params.exchangeAdId);
    res.send(ad);
});

/**
 * Search exchange ads by keyword
 */
const searchExchangeAds = catchAsync(async (req, res) => {
    const { keyword } = req.query;
    const options = pick(req.query, ['sortBy', 'limit', 'page']);

    if (!keyword) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Search keyword is required');
    }

    const results = await exchangeAdService.searchExchangeAds(keyword, options);
    res.send(results);
});

module.exports = {
    createExchangeAd,
    getExchangeAds,
    getExchangeAd,
    updateExchangeAd,
    deleteExchangeAd,
    getUserExchangeAds,
    boostExchangeAd,
    toggleFavoriteExchangeAd,
    searchExchangeAds,
};