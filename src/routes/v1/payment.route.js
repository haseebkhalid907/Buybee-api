const express = require('express');
const auth = require('../../middlewares/auth');
const paymentController = require('../../controllers/payment.controller');
const boostController = require('../../controllers/boost.controller');
const validate = require('../../middlewares/validate');
// We'll add validation schemas later if needed

const router = express.Router();

// Route for creating payment intents
router.post('/create-payment-intent',
    // auth(),
    paymentController.createPaymentIntent);

// Route for processing boost payments - now using boostController
router.post('/create-boost-payment',
    // auth(),
    boostController.createBoostPayment);

// Route for processing checkout
router.post('/checkout',

    auth(),

    paymentController.processCheckout);

// Route for Stripe webhooks
// Note: This route is not authenticated as it's called by Stripe
router.post('/webhook', paymentController.handleStripeWebhook);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment processing and checkout
 */

/**
 * @swagger
 * /payments/create-payment-intent:
 *   post:
 *     summary: Create a payment intent for Stripe
 *     description: Creates a payment intent based on the user's cart
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Payment intent created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clientSecret:
 *                   type: string
 *                 paymentIntentId:
 *                   type: string
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /payments/create-boost-payment:
 *   post:
 *     summary: Process a boost subscription payment
 *     description: Creates a payment for boosting a product listing
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - paymentMethod
 *               - cardDetails
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Amount to charge
 *               paymentMethod:
 *                 type: string
 *                 enum: [credit_card, paypal]
 *                 default: credit_card
 *               cardDetails:
 *                 type: object
 *                 properties:
 *                   number:
 *                     type: string
 *                     description: Credit card number
 *                   expiry:
 *                     type: string
 *                     description: Expiry date (MM/YY)
 *                   cvc:
 *                     type: string
 *                     description: CVC security code
 *                   name:
 *                     type: string
 *                     description: Cardholder name
 *               boostData:
 *                 type: object
 *                 description: Boost subscription details
 *     responses:
 *       "201":
 *         description: Payment processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 paymentId:
 *                   type: string
 *                 amount:
 *                   type: number
 *                 status:
 *                   type: string
 *                 transactionDate:
 *                   type: string
 *                   format: date-time
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "402":
 *         description: Payment failed
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 */

/**
 * @swagger
 * /payments/checkout:
 *   post:
 *     summary: Process checkout
 *     description: Creates an order based on the user's cart and initiates payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shippingAddress
 *               - billingAddress
 *               - paymentMethod
 *             properties:
 *               shippingAddress:
 *                 type: object
 *                 properties:
 *                   fullName: 
 *                     type: string
 *                   address:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   country:
 *                     type: string
 *                   postalCode:
 *                     type: string
 *                   phone:
 *                     type: string
 *               billingAddress:
 *                 type: object
 *                 properties:
 *                   fullName: 
 *                     type: string
 *                   address:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   country:
 *                     type: string
 *                   postalCode:
 *                     type: string
 *                   phone:
 *                     type: string
 *               paymentMethod:
 *                 type: string
 *                 enum: [credit_card, paypal, bank_transfer, cash]
 *               notes:
 *                 type: string
 *     responses:
 *       "201":
 *         description: Checkout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 order:
 *                   type: object
 *                 clientSecret:
 *                   type: string
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */