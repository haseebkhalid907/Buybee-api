const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { exchangeAdService } = require('../services');

/**
 * Create a new exchange ad
 */
const createExchangeAd = catchAsync(async (req, res) => {
    // Ensure req.user exists (auth middleware should handle this, but as a safety check)
    if (!req.user) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Authentication required');
    }

    // Log authentication data for debugging
    console.log("🚀 ~ createExchangeAd ~ req.user:", req.user);
    console.log("🚀 ~ createExchangeAd ~ Authorization header:", req.headers.authorization);

    const userId = req.user._id || req.user.id;
    let images = [];

    // Process uploaded images if available
    if (req.files && req.files.length > 0) {
        images = req.files.map(file => `/uploads/${file.filename}`);
    } else if (req.body.images) {
        // Handle different image formats from the frontend
        if (typeof req.body.images === 'string') {
            try {
                // Try to parse as JSON array
                const parsedImages = JSON.parse(req.body.images);
                if (Array.isArray(parsedImages)) {
                    images = parsedImages;
                } else {
                    // Single image as object or string
                    images = [req.body.images];
                }
            } catch (e) {
                // If not valid JSON, use as a single image path
                images = [req.body.images];
            }
        } else if (Array.isArray(req.body.images)) {
            // Already an array
            images = req.body.images;
        }
    }

    const adData = {
        ...req.body,
        images,
        user: userId
    };

    const ad = await exchangeAdService.createExchangeAd(adData, userId);
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

/**
 * Get all exchange ads for the currently authenticated user
 */
const getCurrentUserExchangeAds = catchAsync(async (req, res) => {
    // Check if user is authenticated
    if (!req.user) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Authentication required');
    }

    // Use either _id or id depending on what's available
    const userId = req.user._id || req.user.id;
    console.log("🚀 ~ getCurrentUserExchangeAds ~ userId:", userId);

    const filter = pick(req.query, ['condition', 'category', 'exchangeType', 'status', 'isActive']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);

    const result = await exchangeAdService.getExchangeAdsByUserId(userId, filter, options);
    res.send(result);
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
    getCurrentUserExchangeAds,
};