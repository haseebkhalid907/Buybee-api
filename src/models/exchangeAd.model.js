const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const exchangeAdSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        brand: {
            type: String,
            required: true,
            trim: true,
        },
        condition: {
            type: String,
            enum: ['new', 'used', 'like-new', 'good', 'fair', 'poor'],
            default: 'used',
        },
        price: {
            type: Number,
            required: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point',
            },
            coordinates: {
                type: [Number],
                required: true,
            }
        },
        address: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: String,
            required: true,
            trim: true,
        },
        categoryName: {
            type: String,
            trim: true,
            // Made optional since clients might not always send it
        },
        exchangeType: {
            type: String,
            enum: ['outright', 'swap', 'both'],
            default: 'outright',
        },
        desiredItems: [{
            type: String,
            trim: true,
        }],
        negotiable: {
            type: Boolean,
            default: false,
        },
        images: [{
            type: String,
            required: true,
        }],
        isActive: {
            type: Boolean,
            default: true,
        },
        isBoosted: {
            type: Boolean,
            default: false,
        },
        boostExpiry: {
            type: Date,
            default: null,
        },
        // user: {
        //     type: mongoose.SchemaTypes.ObjectId,
        //     ref: 'User',
        //     required: true,
        // },
        views: {
            type: Number,
            default: 0,
        },
        favorites: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ['active', 'expired', 'sold', 'inactive'],
            default: 'active',
        },
        attributes: {
            type: Map,
            of: String,
            default: {},
        },
    },
    {
        timestamps: true,
    }
);

// add plugin that converts mongoose to json
exchangeAdSchema.plugin(toJSON);
exchangeAdSchema.plugin(paginate);

/**
 * @typedef ExchangeAd
 */
const ExchangeAd = mongoose.model('ExchangeAd', exchangeAdSchema);

module.exports = ExchangeAd;