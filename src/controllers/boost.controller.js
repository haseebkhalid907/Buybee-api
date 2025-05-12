const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { paymentService } = require('../services');
const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_51OUjQcAPGTSIBiH0hi4jhUlFYDhrrApEwxfhZCKR4PmNGk6H3kt6yLrKZCzXGLvZEnuQEDDSULBS8IEjtQznjWum009tnDWxHN');

/**
 * Process a payment for product boost subscription
 * @route POST /v1/payments/create-boost-payment
 */
const createBoostPayment = catchAsync(async (req, res) => {
    const { amount, paymentMethod, cardDetails, boostData, stripeToken } = req.body;
    const userId = req.user._id;

    // Validate inputs
    if (!amount || amount <= 0) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Valid payment amount is required');
    }

    if (!paymentMethod) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Payment method is required');
    }

    logger.info(`Processing boost payment of ${amount} for user: ${userId}`);
    logger.info('tryyyy');

    try {
        let paymentResult;

        logger.info('tryyyy2222');

        // Use Stripe for payments
        try {
            logger.info('Processing payment with Stripe');

            // Use test tokens instead of raw card data for development
            // In production, the frontend should create a proper token using Stripe.js or Elements
            const testTokens = {
                "4242424242424242": "tok_visa", // Success token
                "4000000000000002": "tok_chargeDeclined", // Declined token
                "4000000000009995": "tok_insufficientFunds" // Insufficient funds token
            };

            // Get the token
            let paymentToken = stripeToken;

            // If we don't have a token and we're in development, use test tokens
            if (!paymentToken && process.env.NODE_ENV !== 'production' && cardDetails) {
                const cardNumber = cardDetails.number;
                paymentToken = testTokens[cardNumber] || "tok_visa";
            }

            if (!paymentToken) {
                throw new Error('Payment token is required for processing card payments');
            }

            // Create a payment intent using the token
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount * 100, // Stripe requires amount in cents
                currency: 'usd',
                payment_method_types: ['card'],
                payment_method_data: {
                    type: 'card',
                    card: {
                        token: paymentToken,
                    }
                },
                confirm: true,
                description: `Boost subscription for ${boostData?.days} days`,
                metadata: {
                    userId: userId.toString(),
                    boostDays: boostData?.days,
                    boostPackage: boostData?.package,
                },
            });
            console.log("🚀 ~ createBoostPayment ~ paymentIntent:", paymentIntent)

            logger.info(`Created Stripe payment intent: ${paymentIntent.id} with status: ${paymentIntent.status}`);

            // Verify payment was successful
            if (paymentIntent.status !== 'succeeded') {
                throw new ApiError(httpStatus.PAYMENT_REQUIRED, `Payment failed with status: ${paymentIntent.status}`);
            }

            paymentResult = {
                id: paymentIntent.id,
                amount,
                status: paymentIntent.status,
                paymentMethod: 'credit_card',
                created: Date.now(),
                description: `Boost subscription for ${boostData?.days} days`,
                stripeVerified: true
            };
            console.log("🚀 ~ createBoostPayment ~ paymentResult:", paymentResult)
        } catch (stripeError) {
            logger.info('cath2222');
            logger.error(`Stripe payment error: ${stripeError.message}`, { error: stripeError });
            throw new ApiError(httpStatus.PAYMENT_REQUIRED, stripeError.message || 'Payment processing failed');
        }

        logger.info('tryyyyenddd');
        logger.info(`Payment processed successfully: ${JSON.stringify(paymentResult)}`);

        // Return successful payment result
        res.status(httpStatus.OK).send({
            success: true,
            paymentId: paymentResult.id,
            amount: paymentResult.amount,
            status: paymentResult.status,
            transactionDate: new Date().toISOString(),
            stripeVerified: true,
            message: 'Payment processed successfully'
        });
    } catch (error) {
        logger.error(`Boost payment error: ${error.message}`, { userId: userId.toString(), error });

        // Return appropriate error response based on the error type
        if (error.statusCode === httpStatus.PAYMENT_REQUIRED || error.type === 'StripeCardError') {
            return res.status(httpStatus.PAYMENT_REQUIRED).send({
                success: false,
                message: error.message || 'Payment failed',
                errorCode: error.type || 'payment_declined'
            });
        }

        throw new ApiError(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
            error.message || 'An error occurred while processing payment');
    }
});

/**
 * Get boost subscription details for a product
 * @route GET /v1/products/:productId/boost
 */
const getBoostDetails = catchAsync(async (req, res) => {
    const { productId } = req.params;

    // This would normally fetch the product and return its boost details
    // For now we'll just return a placeholder

    res.status(httpStatus.OK).send({
        active: true,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        package: 'package2',
        cost: 1145,
        days: 7
    });
});

module.exports = {
    createBoostPayment,
    getBoostDetails,
};