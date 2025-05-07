const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { paymentService, userService } = require('../services');
const ApiError = require('../utils/ApiError');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_51Jh7JGDQKvxeh7WtXe2kJ5RlgXk9zGqOXkzX3gr7V2z2b2ZNY08qSo0XfOFEbrAmSBLD0XBAgz7skmq0hC5YhGof00WJCRyWfP');
const logger = require('../config/logger');

/**
 * Create a payment intent for Stripe
 */
const createPaymentIntent = catchAsync(async (req, res) => {
    const user = await userService.getUserById(req.user.id);

    // Populate cart to calculate total
    await user.populate('cart.product');

    // Calculate cart total
    let total = 0;
    for (const item of user.cart) {
        if (item.product) {
            total += item.product.price * item.quantity;
        }
    }

    // Add tax and shipping
    const tax = total * 0.1; // 10% tax
    const shipping = total > 100 ? 0 : 10; // Free shipping over $100
    total = total + tax + shipping;

    // Create payment intent
    const paymentIntent = await paymentService.createPaymentIntent({
        amount: total,
        currency: 'usd',
        customer: {
            email: user.email,
            _id: user._id
        },
        description: `Payment for order by ${user.name}`
    });

    res.status(httpStatus.OK).send(paymentIntent);
});

/**
 * Process checkout and create order
 */
const processCheckout = catchAsync(async (req, res) => {
    // Make sure we get the user ID correctly from either req.user.id or req.user._id
    const userId = req.user.id || req.user._id;
    const user = await userService.getUserById(userId);

    logger.info('Processing checkout for user:', user.email);

    // Extract checkout data including any selected cart items
    const checkoutData = {
        ...req.body,
        // If selectedCartItems is provided, use it
        selectedCartItems: req.body.selectedCartItems || []
    };

    // Make sure to populate cart products first
    await user.populate('cart.product');

    // Validate cart items have products populated before processing
    if (!req.body.items && user.cart && user.cart.length > 0) {
        const emptyProducts = user.cart.filter(item => !item.product);
        if (emptyProducts.length > 0) {
            logger.error("Found cart items without populated products:", emptyProducts);
            throw new ApiError(httpStatus.BAD_REQUEST, 'Some products in your cart are unavailable');
        }
    }

    // Create order and generate payment intent
    const checkoutResult = await paymentService.processCheckout(checkoutData, user);
    logger.info(`Order created successfully: ${checkoutResult.order.orderNumber}`);

    // If credit card payment, create payment intent
    if (req.body.paymentMethod === 'credit_card') {
        // Calculate total from order
        const total = checkoutResult.order.totalAmount;
        logger.info(`Creating payment intent for order total: ${total}`);

        // Verify total is a valid number
        if (isNaN(total) || total <= 0) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid order total amount');
        }

        try {
            // Create payment intent with order reference
            const paymentIntent = await paymentService.createPaymentIntent({
                amount: total,
                currency: 'usd',
                customer: {
                    email: user.email,
                    _id: user._id
                },
                description: `Payment for order #${checkoutResult.order.orderNumber}`,
                metadata: {
                    orderNumber: checkoutResult.order.orderNumber,
                    orderId: checkoutResult.order._id.toString()
                }
            });

            logger.info(`Payment intent created: ${paymentIntent.paymentIntentId}`);

            // Add client secret to response
            checkoutResult.clientSecret = paymentIntent.clientSecret;

            // Log the client secret to help with debugging (partial, not full)
            const clientSecretStart = paymentIntent.clientSecret.substring(0, 10);
            const clientSecretEnd = paymentIntent.clientSecret.substring(paymentIntent.clientSecret.length - 5);
            logger.info(`Client secret generated: ${clientSecretStart}...${clientSecretEnd}`);
        } catch (error) {
            logger.error('Error creating payment intent:', error);
            throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to initialize payment. Please try again.');
        }
    }

    res.status(httpStatus.CREATED).send(checkoutResult);
});

/**
 * Handle Stripe webhook events
 */
const handleStripeWebhook = catchAsync(async (req, res) => {
    const signature = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    try {
        let event;

        // Verify webhook signature if webhook secret is available
        if (signature && webhookSecret) {
            try {
                event = stripe.webhooks.constructEvent(
                    req.rawBody || req.body, // rawBody should be available if body-parser is configured correctly
                    signature,
                    webhookSecret
                );
                logger.info('Webhook signature verified successfully');
            } catch (err) {
                logger.error('Webhook signature verification failed:', err);
                return res.status(httpStatus.BAD_REQUEST).send(`Webhook signature verification failed: ${err.message}`);
            }
        } else {
            // If no signature or secret available, use the raw event
            event = req.body;
            logger.warn('Webhook received without signature verification');
        }

        // Process different webhook events
        await paymentService.handleStripeWebhook(event);

        res.status(httpStatus.OK).send({ received: true });
    } catch (err) {
        logger.error('Stripe webhook error:', err);
        res.status(httpStatus.BAD_REQUEST).send(`Webhook Error: ${err.message}`);
    }
});

module.exports = {
    createPaymentIntent,
    processCheckout,
    handleStripeWebhook,
};