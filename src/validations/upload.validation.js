const Joi = require('joi');

const deleteImage = {
    body: Joi.object().keys({
        publicId: Joi.string().required(),
    }),
};

module.exports = {
    deleteImage,
};
