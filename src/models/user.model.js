const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');
const { roles, USER_ROLES } = require('../config/roles');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      validate(value) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error('Password must contain at least one letter and one number');
        }
      },
      private: true,
    },
    role: {
      type: String,
      enum: roles,
      default: USER_ROLES.BUYER,
    },
    profileImage: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      trim: true,
      validate(value) {
        if (value && !validator.isMobilePhone(value)) {
          throw new Error('Invalid phone number');
        }
      },
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    addresses: [
      {
        name: String,
        addressLine1: String,
        addressLine2: String,
        city: String,
        state: String,
        country: String,
        postalCode: String,
        isDefault: {
          type: Boolean,
          default: false,
        },
        phone: String,
      },
    ],
    // Seller-specific fields
    sellerProfile: {
      storeName: {
        type: String,
        trim: true,
      },
      storeDescription: {
        type: String,
        trim: true,
      },
      storeImage: {
        type: String,
      },
      businessAddress: {
        addressLine1: String,
        addressLine2: String,
        city: String,
        state: String,
        country: String,
        postalCode: String,
      },
      businessPhone: {
        type: String,
        trim: true,
      },
      businessEmail: {
        type: String,
        trim: true,
        lowercase: true,
        validate(value) {
          if (value && !validator.isEmail(value)) {
            throw new Error('Invalid email');
          }
        },
      },
      taxId: {
        type: String,
        trim: true,
      },
      isVerified: {
        type: Boolean,
        default: false,
      },
      // Add seller registration progress tracking
      registrationCompleted: {
        type: Boolean,
        default: false
      },
      registrationSteps: {
        termsAccepted: {
          type: Boolean,
          default: false
        },
        storeInfoCompleted: {
          type: Boolean,
          default: false
        },
        personalInfoCompleted: {
          type: Boolean,
          default: false
        },
        bankInfoCompleted: {
          type: Boolean,
          default: false
        }
      },
      rating: {
        average: {
          type: Number,
          default: 0,
          min: 0,
          max: 5,
        },
        count: {
          type: Number,
          default: 0,
        },
      },
      dateJoined: {
        type: Date,
        default: Date.now,
      },
      paymentInfo: {
        accountHolder: String,
        accountNumber: String,
        bankName: String,
        routingNumber: String,
        paypalEmail: String,
      },
    },
    preferences: {
      notifications: {
        email: {
          type: Boolean,
          default: true,
        },
        push: {
          type: Boolean,
          default: true,
        },
        orderUpdates: {
          type: Boolean,
          default: true,
        },
        marketing: {
          type: Boolean,
          default: false,
        },
      },
      language: {
        type: String,
        default: 'en',
      },
      currency: {
        type: String,
        default: 'USD',
      },
    },
    wishlist: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Product',
      },
    ],
    cart: [
      {
        product: {
          type: mongoose.SchemaTypes.ObjectId,
          ref: 'Product',
        },
        quantity: {
          type: Number,
          default: 1,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    lastLogin: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'deleted'],
      default: 'active',
    },
    otpForVerification: {
      code: {
        type: String,
      },
      expiresAt: {
        type: Date,
      },
    },
    passwordResetToken: {
      token: {
        type: String,
      },
      expiresAt: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

/**
 * Check if user has seller role
 * @returns {boolean}
 */
userSchema.methods.isSeller = function () {
  return this.role === USER_ROLES.SELLER;
};

/**
 * Check if user has admin role
 * @returns {boolean}
 */
userSchema.methods.isAdmin = function () {
  return this.role === USER_ROLES.ADMIN;
};

/**
 * Check if user has buyer role
 * @returns {boolean}
 */
userSchema.methods.isBuyer = function () {
  return this.role === USER_ROLES.BUYER;
};

/**
 * Add product to wishlist
 * @param {ObjectId} productId - Product to add to wishlist
 */
userSchema.methods.addToWishlist = function (productId) {
  if (this.wishlist.indexOf(productId) === -1) {
    this.wishlist.push(productId);
  }
};

/**
 * Remove product from wishlist
 * @param {ObjectId} productId - Product to remove from wishlist
 */
userSchema.methods.removeFromWishlist = function (productId) {
  this.wishlist = this.wishlist.filter(id => id.toString() !== productId.toString());
};

/**
 * Add product to cart
 * @param {ObjectId} productId - Product to add to cart
 * @param {number} quantity - Quantity to add
 */
userSchema.methods.addToCart = function (productId, quantity = 1) {
  const existingItem = this.cart.find(item => item.product.toString() === productId.toString());

  if (existingItem) {
    existingItem.quantity += quantity;
    existingItem.addedAt = Date.now();
  } else {
    this.cart.push({
      product: productId,
      quantity,
      addedAt: Date.now(),
    });
  }
};

/**
 * Remove product from cart
 * @param {ObjectId} productId - Product to remove from cart
 */
userSchema.methods.removeFromCart = function (productId) {
  this.cart = this.cart.filter(item => item.product.toString() !== productId.toString());
};

/**
 * Update cart item quantity
 * @param {ObjectId} productId - Product to update
 * @param {number} quantity - New quantity
 */
userSchema.methods.updateCartItemQuantity = function (productId, quantity) {
  const existingItem = this.cart.find(item => item.product.toString() === productId.toString());

  if (existingItem) {
    existingItem.quantity = quantity;
    existingItem.addedAt = Date.now();
  }
};

/**
 * Clear the cart
 */
userSchema.methods.clearCart = function () {
  this.cart = [];
};

userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

/**
 * @typedef User
 */
const User = mongoose.model('User', userSchema);

module.exports = User;
