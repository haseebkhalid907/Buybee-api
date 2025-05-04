const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createReview = {
    params: Joi.object().keys({
        productId: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object().keys({
        rating: Joi.number().integer().min(1).max(5).required(),
        comment: Joi.string().required(),
    }),
};

const getReviews = {
    params: Joi.object().keys({
        productId: Joi.string().custom(objectId).required(),
    }),
    query: Joi.object().keys({
        sortBy: Joi.string(),
        limit: Joi.number().integer(),
        page: Joi.number().integer(),
    }),
};

const updateReview = {
    params: Joi.object().keys({
        productId: Joi.string().custom(objectId).required(),
        reviewId: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object()
        .keys({
            rating: Joi.number().integer().min(1).max(5),
            comment: Joi.string(),
        })
        .min(1),
};

const deleteReview = {
    params: Joi.object().keys({
        productId: Joi.string().custom(objectId).required(),
        reviewId: Joi.string().custom(objectId).required(),
    }),
};

module.exports = {
    createReview,
    getReviews,
    updateReview,
    deleteReview,
};