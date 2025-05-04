const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createCategory = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        description: Joi.string(),
        parent: Joi.string().custom(objectId),
        image: Joi.string(),
        level: Joi.number(),
        active: Joi.boolean(),
        order: Joi.number(),
        featured: Joi.boolean(),
    }),
};

const getCategories = {
    query: Joi.object().keys({
        name: Joi.string(),
        slug: Joi.string(),
        parent: Joi.string().custom(objectId),
        sortBy: Joi.string(),
        limit: Joi.number().integer(),
        page: Joi.number().integer(),
        active: Joi.boolean(),
        featured: Joi.boolean(),
    }),
};

const getCategory = {
    params: Joi.object().keys({
        categoryId: Joi.string().custom(objectId),
    }),
};

const updateCategory = {
    params: Joi.object().keys({
        categoryId: Joi.string().custom(objectId),
    }),
    body: Joi.object()
        .keys({
            name: Joi.string(),
            description: Joi.string(),
            parent: Joi.string().custom(objectId),
            image: Joi.string(),
            level: Joi.number(),
            active: Joi.boolean(),
            order: Joi.number(),
            featured: Joi.boolean(),
        })
        .min(1),
};

const deleteCategory = {
    params: Joi.object().keys({
        categoryId: Joi.string().custom(objectId),
    }),
};

module.exports = {
    createCategory,
    getCategories,
    getCategory,
    updateCategory,
    deleteCategory,
};