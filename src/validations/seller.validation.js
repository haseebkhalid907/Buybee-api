const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const createSeller = {
  body: Joi.object().keys({
    userId: Joi.string().optional(), // Assuming userId might be generated automatically
    storeName: Joi.string().required().trim(),
    categary: Joi.array().items(Joi.string()).required(),
    city: Joi.string().optional(),
    area: Joi.string().optional(),
    streetNo: Joi.string().optional(),
    shopNo: Joi.string().optional(),
    description: Joi.string().required(),
    email: Joi.string().required().email(),
    phone: Joi.string().required().pattern(/^[0-9]{10,15}$/), // Allows phone numbers between 10 and 15 digits
    cnicFront: Joi.string().required(), // Assuming it's a URL or path
    cnicBack: Joi.string().required(), // Assuming it's a URL or path
    bankName: Joi.string().optional(),
    accountOrIban: Joi.string().optional(),
    checkbook: Joi.string().required(), // Assuming it's a URL or path
    paymentShedule: Joi.string().required(),
    passCode: Joi.string().required().trim(),
  }),
};
const getSellers = {
  query: Joi.object().keys({
    shopName: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getSeller = {
  params: Joi.object().keys({
    sellerId: Joi.string().custom(objectId),
  }),
};

const updateSeller = {
  params: Joi.object().keys({
    sellerId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      password: Joi.string().custom(password),
      name: Joi.string(),
    })
    .min(1),
};

const deleteSeller = {
  params: Joi.object().keys({
    sellerId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createSeller,
  getSellers,
  getSeller,
  updateSeller,
  deleteSeller,
};
