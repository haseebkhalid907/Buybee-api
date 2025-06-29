const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createExchangeAd = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        description: Joi.string().required(),
        // Make images more flexible - sometimes it's an array of strings, sometimes a string
        images: Joi.alternatives().try(
            Joi.array().items(Joi.string()).min(1),
            Joi.string()
        ),
        // Make category optional since there could be categoryId or category
        category: Joi.string(),
        categoryName: Joi.string(),
        brand: Joi.string().required(),
        condition: Joi.string().valid('new', 'used', 'like-new', 'good', 'fair', 'poor').default('good'),
        price: Joi.number().min(0).required(),
        desiredItems: Joi.alternatives().try(
            Joi.array().items(Joi.string()),
            Joi.string(),
            Joi.any().allow(null, '') // Allow empty or null values
        ),
        negotiable: Joi.boolean().default(false),
        // Make location more flexible
        location: Joi.alternatives().try(
            Joi.string(),
            Joi.object({
                type: Joi.string().valid('Point').default('Point'),
                coordinates: Joi.array().items(Joi.number()).length(2)
            }),
            Joi.any().allow(null, '') // Allow empty or null values
        ),
        address: Joi.string().allow('', null),
        isActive: Joi.boolean().default(true),
        exchangeType: Joi.string().valid('outright', 'swap', 'both'),
        city: Joi.string().allow('', null),
        showPhoneNumber: Joi.boolean().default(false),
        featured: Joi.boolean(),
        boost: Joi.object().allow(null),
        attributes: Joi.object().pattern(/.*/, Joi.string()).allow(null),
        user: Joi.string() // Allow user ID to be passed
    }).unknown(true), // Allow unknown fields for flexibility
};

const getExchangeAds = {
    query: Joi.object().keys({
        category: Joi.string().custom(objectId),
        brand: Joi.string(),
        condition: Joi.string().valid('new', 'like-new', 'good', 'fair', 'poor'),
        minPrice: Joi.number(),
        maxPrice: Joi.number(),
        negotiable: Joi.boolean(),
        sortBy: Joi.string(),
        limit: Joi.number().integer(),
        page: Joi.number().integer(),
        isActive: Joi.boolean(),
    }),
};

const getExchangeAd = {
    params: Joi.object().keys({
        exchangeAdId: Joi.string().custom(objectId).required(),
    }),
};

const updateExchangeAd = {
    params: Joi.object().keys({
        exchangeAdId: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object()
        .keys({
            name: Joi.string(),
            description: Joi.string(),
            images: Joi.array().items(Joi.string()),
            category: Joi.string().custom(objectId),
            categoryName: Joi.string(),
            brand: Joi.string(),
            condition: Joi.string().valid('new', 'like-new', 'good', 'fair', 'poor'),
            price: Joi.number().min(0),
            desiredItems: Joi.array().items(Joi.string()),
            negotiable: Joi.boolean(),
            location: Joi.object({
                type: Joi.string().valid('Point').default('Point'),
                coordinates: Joi.array().items(Joi.number()).length(2)
            }),
            address: Joi.string(),
            isActive: Joi.boolean(),
            attributes: Joi.object().pattern(/.*/, Joi.string())
        })
        .min(1),
};

const deleteExchangeAd = {
    params: Joi.object().keys({
        exchangeAdId: Joi.string().custom(objectId).required(),
    }),
};

const boostExchangeAd = {
    params: Joi.object().keys({
        exchangeAdId: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object().keys({
        days: Joi.number().integer().min(1).max(30).required(),
    }),
};

const getUserExchangeAds = {
    params: Joi.object().keys({
        userId: Joi.string().custom(objectId).required(),
    }),
    query: Joi.object().keys({
        sortBy: Joi.string(),
        limit: Joi.number().integer(),
        page: Joi.number().integer(),
        isActive: Joi.boolean(),
    }),
};

const searchExchangeAds = {
    query: Joi.object().keys({
        keyword: Joi.string().required(),
        sortBy: Joi.string(),
        limit: Joi.number().integer(),
        page: Joi.number().integer(),
    }),
};

module.exports = {
    createExchangeAd,
    getExchangeAds,
    getExchangeAd,
    updateExchangeAd,
    deleteExchangeAd,
    boostExchangeAd,
    getUserExchangeAds,
    searchExchangeAds,
};