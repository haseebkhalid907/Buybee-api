const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { paymentService, userService } = require('../services');
const ApiError = require('../utils/ApiError');

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
    const user = await userService.getUserById(req.user.id);

    // Create order and generate payment intent
    const checkoutResult = await paymentService.processCheckout(req.body, user);

    // If credit card payment, create payment intent
    if (req.body.paymentMethod === 'credit_card') {
        // Calculate total from order
        const total = checkoutResult.order.total;

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
                orderNumber: checkoutResult.order.orderNumber
            }
        });

        // Add client secret to response
        checkoutResult.clientSecret = paymentIntent.clientSecret;
    }

    res.status(httpStatus.CREATED).send(checkoutResult);
});

/**
 * Handle Stripe webhook events
 */
const handleStripeWebhook = catchAsync(async (req, res) => {
    // Verify webhook signature if needed
    // const signature = req.headers['stripe-signature'];

    try {
        const event = req.body;

        // Process different webhook events
        await paymentService.handleStripeWebhook(event);

        res.status(httpStatus.OK).send({ received: true });
    } catch (err) {
        console.error('Stripe webhook error:', err);
        res.status(httpStatus.BAD_REQUEST).send(`Webhook Error: ${err.message}`);
    }
});

module.exports = {
    createPaymentIntent,
    processCheckout,
    handleStripeWebhook,
};