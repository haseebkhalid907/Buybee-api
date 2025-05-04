const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { USER_ROLES } = require('../config/roles');

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    images: [{
      type: String,
      required: true,
    }],
    category: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Category',
      required: true,
    },
    seller: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    condition: {
      type: String,
      enum: ['new', 'like-new', 'good', 'fair', 'poor'],
      required: true,
    },
    specifications: {
      type: Map,
      of: String,
      default: {},
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
    tags: [{
      type: String,
      trim: true,
    }],
    featured: {
      type: Boolean,
      default: false,
    },
    discount: {
      percentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      active: {
        type: Boolean,
        default: false,
      },
      startDate: {
        type: Date,
      },
      endDate: {
        type: Date,
      },
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'deleted'],
      default: 'active',
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: {
        type: String,
        enum: ['cm', 'in'],
        default: 'cm',
      },
    },
    weight: {
      value: Number,
      unit: {
        type: String,
        enum: ['kg', 'lb'],
        default: 'kg',
      },
    },
    shipping: {
      free: {
        type: Boolean,
        default: false,
      },
      cost: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    views: {
      type: Number,
      default: 0,
    },
    reviews: [{
      user: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
      },
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      comment: {
        type: String,
        trim: true,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
productSchema.plugin(toJSON);
productSchema.plugin(paginate);

/**
 * Check if seller owns product
 * @param {ObjectId} productId - Product ID to check
 * @param {ObjectId} sellerId - Seller ID
 * @returns {Promise<boolean>}
 */
productSchema.statics.isSellerProduct = async function (productId, sellerId) {
  const product = await this.findById(productId);
  return product && product.seller.toString() === sellerId.toString();
};

/**
 * Update product rating when a new review is added
 */
productSchema.methods.updateRating = function () {
  if (!this.reviews || this.reviews.length === 0) {
    this.rating.average = 0;
    this.rating.count = 0;
    return;
  }

  const sum = this.reviews.reduce((total, review) => total + review.rating, 0);
  this.rating.average = sum / this.reviews.length;
  this.rating.count = this.reviews.length;
};

/**
 * Pre-save hook to update rating when reviews change
 */
productSchema.pre('save', function (next) {
  if (this.isModified('reviews')) {
    this.updateRating();
  }
  next();
});

/**
 * @typedef Product
 */
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
