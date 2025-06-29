const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const createUser = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string().required(),
    phone: Joi.number().required(),
    role: Joi.string().required().valid('user', 'admin'),
  }),
};

const getUsers = {
  query: Joi.object().keys({
    name: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().required().custom((value, helpers) => {
      if (value === 'me') {
        return value;
      }
      return objectId(value, helpers);
    }),
  }),
};

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.string().required().custom((value, helpers) => {
      if (value === 'me') {
        return value;
      }
      return objectId(value, helpers);
    }),
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      password: Joi.string().custom(password),
      name: Joi.string(),
      // Add sellerProfile fields
      sellerProfile: Joi.object().keys({
        storeName: Joi.string(),
        storeDescription: Joi.string(),
        storeImage: Joi.string(),
        businessAddress: Joi.object().keys({
          addressLine1: Joi.string(),
          addressLine2: Joi.string(),
          city: Joi.string(),
          state: Joi.string(),
          country: Joi.string(),
          postalCode: Joi.string(),
        }),
        businessPhone: Joi.string(),
        businessEmail: Joi.string().email(),
        taxId: Joi.string(),
        isVerified: Joi.boolean(),
        registrationCompleted: Joi.boolean(),
        registrationSteps: Joi.object().keys({
          termsAccepted: Joi.boolean(),
          storeInfoCompleted: Joi.boolean(),
          personalInfoCompleted: Joi.boolean(),
          bankInfoCompleted: Joi.boolean(),
        }),
        rating: Joi.object().keys({
          average: Joi.number(),
          count: Joi.number(),
        }),
        dateJoined: Joi.date(),
        paymentInfo: Joi.object().keys({
          accountHolder: Joi.string(),
          accountNumber: Joi.string(),
          bankName: Joi.string(),
          routingNumber: Joi.string(),
          paypalEmail: Joi.string(),
        }),
      }),
    })
    .min(1),
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const updateSellerRegistrationStep = {
  params: Joi.object().keys({
    userId: Joi.string().required().custom((value, helpers) => {
      if (value === 'me') {
        return value;
      }
      return objectId(value, helpers);
    })
  }),
  body: Joi.object().keys({
    step: Joi.string().required().valid('termsAccepted', 'storeInfoCompleted', 'personalInfoCompleted', 'bankInfoCompleted'),
    completed: Joi.boolean().required()
  })
};

const getSellerRegistrationStatus = {
  params: Joi.object().keys({
    userId: Joi.string().required().custom((value, helpers) => {
      if (value === 'me') {
        return value;
      }
      return objectId(value, helpers);
    })
  })
};

// Add profile validation schema for /profile endpoint
const updateProfile = {
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      password: Joi.string().custom(password),
      name: Joi.string(),
      phone: Joi.string(), // Add phone field
      role: Joi.string().valid('buyer', 'seller', 'admin'), // Added role field with valid values
      // Add sellerProfile fields
      sellerProfile: Joi.object().keys({
        storeName: Joi.string(),
        storeDescription: Joi.string(),
        storeImage: Joi.string(),
        businessAddress: Joi.object().keys({
          addressLine1: Joi.string(),
          addressLine2: Joi.string(),
          city: Joi.string(),
          state: Joi.string(),
          country: Joi.string(),
          postalCode: Joi.string(),
        }),
        businessPhone: Joi.string(),
        businessEmail: Joi.string().email(),
        taxId: Joi.string(),
        isVerified: Joi.boolean(),
        registrationCompleted: Joi.boolean(),
        registrationSteps: Joi.object().keys({
          termsAccepted: Joi.boolean(),
          storeInfoCompleted: Joi.boolean(),
          personalInfoCompleted: Joi.boolean(),
          bankInfoCompleted: Joi.boolean(),
        }),
        rating: Joi.object().keys({
          average: Joi.number(),
          count: Joi.number(),
        }),
        dateJoined: Joi.date(),
        paymentInfo: Joi.object().keys({
          accountHolder: Joi.string(),
          accountNumber: Joi.string(),
          bankName: Joi.string(),
          routingNumber: Joi.string(),
          paypalEmail: Joi.string(),
        }),
      }),
    })
    .min(1),
};

const changePassword = {
  body: Joi.object().keys({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().required().custom(password),
  }),
};

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  updateSellerRegistrationStep,
  getSellerRegistrationStatus,
  updateProfile,
  changePassword
};
