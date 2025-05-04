const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { USER_ROLES } = require('../config/roles');

const orderSchema = mongoose.Schema(
    {
        orderNumber: {
            type: String,
            required: true,
            unique: true,
        },
        customer: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'User',
            required: true,
        },
        items: [
            {
                product: {
                    type: mongoose.SchemaTypes.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },
                price: {
                    type: Number,
                    required: true,
                    min: 0,
                },
                seller: {
                    type: mongoose.SchemaTypes.ObjectId,
                    ref: 'User',
                    required: true,
                }
            },
        ],
        status: {
            type: String,
            enum: [
                'pending',
                'processing',
                'shipped',
                'delivered',
                'canceled',
                'refunded',
            ],
            default: 'pending',
        },
        paymentMethod: {
            type: String,
            enum: ['credit_card', 'paypal', 'bank_transfer', 'cash_on_delivery'],
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'refunded'],
            default: 'pending',
        },
        paymentDetails: {
            transactionId: String,
            paymentDate: Date,
            cardLastFour: String,
        },
        subtotal: {
            type: Number,
            required: true,
            min: 0,
        },
        tax: {
            type: Number,
            default: 0,
            min: 0,
        },
        shippingCost: {
            type: Number,
            default: 0,
            min: 0,
        },
        discount: {
            type: Number,
            default: 0,
            min: 0,
        },
        total: {
            type: Number,
            required: true,
            min: 0,
        },
        shippingAddress: {
            fullName: String,
            address: String,
            city: String,
            state: String,
            postalCode: String,
            country: String,
            phone: String,
        },
        billingAddress: {
            fullName: String,
            address: String,
            city: String,
            state: String,
            postalCode: String,
            country: String,
            phone: String,
        },
        notes: {
            type: String,
            trim: true,
        },
        trackingNumber: {
            type: String,
            default: null,
        },
        estimatedDeliveryDate: {
            type: Date,
        },
        actualDeliveryDate: {
            type: Date,
        },
        cancelReason: {
            type: String,
        },
        refundDetails: {
            amount: Number,
            reason: String,
            date: Date,
            transactionId: String,
        },
        statusHistory: [
            {
                status: {
                    type: String,
                    enum: [
                        'pending',
                        'processing',
                        'shipped',
                        'delivered',
                        'canceled',
                        'refunded',
                    ],
                },
                date: {
                    type: Date,
                    default: Date.now,
                },
                note: String,
                updatedBy: {
                    type: mongoose.SchemaTypes.ObjectId,
                    ref: 'User',
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

// add plugin that converts mongoose to json
orderSchema.plugin(toJSON);
orderSchema.plugin(paginate);

/**
 * Generate unique order number
 */
orderSchema.statics.generateOrderNumber = async function () {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const orderNumber = `ORD-${dateStr}-${randomStr}`;

    // Verify order number is unique
    const existingOrder = await this.findOne({ orderNumber });
    if (existingOrder) {
        // Try again if number already exists
        return this.generateOrderNumber();
    }

    return orderNumber;
};

/**
 * Add a status update to the order
 * @param {string} status - New status
 * @param {string} note - Optional note about the status change
 * @param {ObjectId} userId - ID of the user making the change
 */
orderSchema.methods.addStatusHistory = function (status, note, userId) {
    this.status = status;

    this.statusHistory.push({
        status,
        date: new Date(),
        note: note || '',
        updatedBy: userId,
    });
};

/**
 * Check if user is involved with this order (as customer or seller)
 * @param {ObjectId} userId - User ID to check
 * @param {string} role - User role (buyer or seller)
 * @returns {boolean}
 */
orderSchema.methods.isUserInvolved = function (userId, role) {
    if (!userId) return false;

    // Convert to string for comparison
    const userIdStr = userId.toString();

    // For buyer/customer
    if (role === USER_ROLES.BUYER && this.customer.toString() === userIdStr) {
        return true;
    }

    // For seller - check if user is selling any item in the order
    if (role === USER_ROLES.SELLER) {
        return this.items.some(item => item.seller.toString() === userIdStr);
    }

    // Admin role is checked at the authorization middleware
    return false;
};

/**
 * @typedef Order
 */
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;