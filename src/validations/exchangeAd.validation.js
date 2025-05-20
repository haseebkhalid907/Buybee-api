const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createExchangeAd = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        description: Joi.string().required(),
        images: Joi.array().items(Joi.string()).min(1).required(),
        category: Joi.string().custom(objectId).required(),
        categoryName: Joi.string().required(),
        brand: Joi.string().required(),
        condition: Joi.string().valid('new', 'like-new', 'good', 'fair', 'poor').required(),
        price: Joi.number().min(0).required(),
        desiredItems: Joi.array().items(Joi.string()).min(1).required(),
        negotiable: Joi.boolean().default(false),
        location: Joi.object({
            type: Joi.string().valid('Point').default('Point'),
            coordinates: Joi.array().items(Joi.number()).length(2).required()
        }).required(),
        address: Joi.string().required(),
        isActive: Joi.boolean().default(true),
        attributes: Joi.object().pattern(/.*/, Joi.string())
    }),
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