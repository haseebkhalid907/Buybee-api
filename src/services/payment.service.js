const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_DUMMY_KEY');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');
const { userService, orderService, productService } = require('../services');

/**
 * Create a payment intent with Stripe
 * @param {Object} paymentData
 * @returns {Promise<Object>}
 */
const createPaymentIntent = async (paymentData) => {
    try {
        const { amount, currency = 'usd', customer, description } = paymentData;

        // Create a payment intent with Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe requires amount in cents
            currency,
            description,
            metadata: {
                customerEmail: customer.email,
                customerId: customer._id.toString()
            }
        });

        return {
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        };
    } catch (error) {
        logger.error('Payment intent creation failed:', error);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Payment processing failed');
    }
};

/**
 * Process checkout and create an order
 * @param {Object} checkoutData
 * @param {User} user
 * @returns {Promise<Object>}
 */
const processCheckout = async (checkoutData, user) => {
    const {
        shippingAddress,
        billingAddress,
        paymentMethod,
        notes
    } = checkoutData;

    // Populate cart details
    await user.populate('cart.product');

    // Validate cart is not empty
    if (!user.cart || user.cart.length === 0) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Cart is empty');
    }

    // Calculate order details
    let subtotal = 0;
    const items = [];

    for (const item of user.cart) {
        const product = item.product;

        // Check product exists and has enough stock
        if (!product) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Product not found');
        }

        if (product.stock < item.quantity) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                `Not enough stock available for ${product.name}`
            );
        }

        // Calculate item price
        const itemPrice = product.price;
        subtotal += itemPrice * item.quantity;

        // Add to order items
        items.push({
            product: product._id,
            quantity: item.quantity,
            price: itemPrice,
            seller: product.seller
        });

        // Update product stock
        await productService.updateProductById(product._id, {
            stock: product.stock - item.quantity
        });
    }

    // Calculate tax and shipping
    const taxRate = 0.1; // 10% tax
    const tax = subtotal * taxRate;
    const shippingCost = subtotal > 100 ? 0 : 10; // Free shipping over $100

    // Calculate total
    const total = subtotal + tax + shippingCost;

    // Generate order number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const orderNumber = `ORD-${dateStr}-${randomStr}`;

    // Create order
    const orderData = {
        orderNumber,
        customer: user._id,
        items,
        status: 'pending',
        paymentMethod,
        paymentStatus: 'pending',
        subtotal,
        tax,
        shippingCost,
        total,
        shippingAddress,
        billingAddress,
        notes,
        statusHistory: [{
            status: 'pending',
            date: new Date(),
            note: 'Order created'
        }]
    };

    // Create order in database
    const order = await orderService.createOrder(orderData);

    // Clear user's cart after successful order creation
    user.clearCart();
    await user.save();

    return {
        order,
        clientSecret: null // Will be set by the payment controller
    };
};

/**
 * Handle Stripe webhook events
 * @param {Object} event - Stripe webhook event
 * @returns {Promise<void>}
 */
const handleStripeWebhook = async (event) => {
    switch (event.type) {
        case 'payment_intent.succeeded': {
            const paymentIntent = event.data.object;
            const orderNumber = paymentIntent.metadata.orderNumber;

            if (orderNumber) {
                // Find order by order number
                const order = await orderService.getOrderByNumber(orderNumber);

                if (order) {
                    // Update order payment status
                    await orderService.updateOrderById(order._id, {
                        paymentStatus: 'paid',
                        paymentDetails: {
                            transactionId: paymentIntent.id,
                            paymentDate: new Date(),
                            cardLastFour: paymentIntent.payment_method_details?.card?.last4 || '',
                            receiptUrl: paymentIntent.receipt_url
                        },
                        status: 'processing',
                        statusHistory: [
                            ...order.statusHistory,
                            {
                                status: 'processing',
                                date: new Date(),
                                note: 'Payment confirmed'
                            }
                        ]
                    });
                }
            }
            break;
        }
        case 'payment_intent.payment_failed': {
            const paymentIntent = event.data.object;
            const orderNumber = paymentIntent.metadata.orderNumber;

            if (orderNumber) {
                // Find order by order number
                const order = await orderService.getOrderByNumber(orderNumber);

                if (order) {
                    // Update order payment status
                    await orderService.updateOrderById(order._id, {
                        paymentStatus: 'failed',
                        status: 'pending',
                        statusHistory: [
                            ...order.statusHistory,
                            {
                                status: 'pending',
                                date: new Date(),
                                note: 'Payment failed: ' + (paymentIntent.last_payment_error?.message || 'Unknown reason')
                            }
                        ]
                    });
                }
            }
            break;
        }
        default:
            // Handle other event types as needed
            logger.info(`Unhandled Stripe event type: ${event.type}`);
    }
};

module.exports = {
    createPaymentIntent,
    processCheckout,
    handleStripeWebhook
};