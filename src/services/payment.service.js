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

        // Ensure amount is a valid number
        const validAmount = Number(amount);
        if (isNaN(validAmount) || validAmount <= 0) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid payment amount');
        }

        // Create a payment intent with Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(validAmount * 100), // Stripe requires amount in cents
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
        notes,
        items: checkoutItems, // Selected items for checkout from the request
        selectedCartItems = [] // IDs of selected cart items when checking out from cart
    } = checkoutData;

    // Try to use items from request first, then selected cart items, then fall back to user's full cart
    let cartItems = [];
    let useCartFromUser = false;

    if (checkoutItems && Array.isArray(checkoutItems) && checkoutItems.length > 0) {
        // Use items passed directly in the request
        cartItems = checkoutItems;
        logger.info(`Using ${cartItems.length} items passed directly in checkout request`);
    } else if (selectedCartItems.length > 0) {
        // Populate user's cart
        await user.populate('cart.product');

        // Filter cart to only include selected items
        cartItems = user.cart.filter(cartItem => {
            const itemId = cartItem._id?.toString();
            return itemId && selectedCartItems.includes(itemId);
        });

        useCartFromUser = true;
        logger.info(`Using ${cartItems.length} selected items from user's cart`);
    } else {
        // Populate cart details from user (full cart)
        await user.populate('cart.product');

        // Use all items from user's cart
        if (user.cart && user.cart.length > 0) {
            cartItems = user.cart;
            useCartFromUser = true;
            logger.info(`Using all ${cartItems.length} items from user's cart`);
        } else {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Cart is empty. Please add items to your cart or provide items in the request.');
        }
    }

    // Validate cart is not empty
    if (!cartItems || cartItems.length === 0) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Cart is empty');
    }

    // Calculate order details
    let subtotal = 0;
    const orderItems = [];

    for (const item of cartItems) {
        // Handle both user cart items and items passed in request
        let productId;
        let product;

        if (useCartFromUser) {
            // Access _id instead of id to ensure consistent MongoDB ObjectId access
            productId = item.product?._id || item.product?.id;
            product = item.product;
            if (!productId) {
                console.error('Product ID missing in cart item:', item);
                throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid product in cart');
            }
        } else {
            // For items sent directly in the request
            if (item.product) {
                // If the full product object is passed
                if (typeof item.product === 'object') {
                    product = item.product;
                    productId = item.product._id || item.product.id;
                } else {
                    // If just the ID is passed
                    productId = item.product;
                    // Fetch product from database
                    product = await productService.getProductById(productId);
                }
            } else if (item.productId) {
                productId = item.productId;
                product = await productService.getProductById(productId);
            } else {
                throw new ApiError(httpStatus.BAD_REQUEST, 'Product information missing in checkout item');
            }
        }

        if (!productId || !product) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Product information is required for each item');
        }

        const quantity = parseInt(item.quantity) || 1;

        // Verify product has a valid price
        if (product.price === undefined || product.price === null || isNaN(Number(product.price))) {
            console.error('Invalid product price:', product);
            throw new ApiError(httpStatus.BAD_REQUEST, `Invalid price for product: ${product.name || 'Unknown product'}`);
        }

        if (product.stock !== undefined && product.stock !== null && product.stock < quantity) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                `Not enough stock available for ${product.name}`
            );
        }

        // Calculate item price
        const itemPrice = Number(product.price) || 0;
        const itemTotal = itemPrice * quantity;
        subtotal += itemTotal;

        // Add to order items
        orderItems.push({
            product: productId,
            quantity: quantity,
            price: itemPrice,
            seller: product.seller || product.userId
        });

        // Update product stock (only if stock field exists)
        if (product.stock !== undefined && product.stock !== null) {
            await productService.updateProductById(productId, {
                stock: Math.max(0, product.stock - quantity)
            });
        }
    }

    // Ensure subtotal is a valid number
    subtotal = Number(subtotal) || 0;

    // Calculate tax and shipping
    const taxRate = 0.1; // 10% tax
    const tax = Number((subtotal * taxRate).toFixed(2)) || 0;
    const shippingCost = subtotal > 100 ? 0 : 10; // Free shipping over $100

    // Calculate total - ensure all values are properly converted to numbers
    const total = Number((subtotal + tax + shippingCost).toFixed(2)) || 0;

    // Generate order number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const orderNumber = `ORD-${dateStr}-${randomStr}`;

    // Set estimated delivery date (7 days from now)
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 7);

    // Extract shipping info - use firstName, lastName from fullName if available
    const fullName = shippingAddress?.fullName || '';
    let firstName = '';
    let lastName = '';

    if (fullName) {
        const nameParts = fullName.split(' ');
        firstName = nameParts[0] || '';
        lastName = nameParts.slice(1).join(' ') || '';
    }

    // Create order
    const orderData = {
        orderNumber,
        customer: user._id,
        items: orderItems,
        status: 'pending',
        paymentMethod: paymentMethod || 'credit_card',
        paymentStatus: 'pending',
        subtotal: subtotal,
        tax: tax,
        shippingCost: shippingCost,
        total: total,
        phone: String(shippingAddress?.phone || user.phone || ''),
        shippingCharges: shippingCost,
        totalAmount: total,
        firstName: firstName || user.name?.split(' ')[0] || 'Customer',
        lastName: lastName || user.name?.split(' ').slice(1).join(' ') || 'User',
        email: user.email || 'customer@example.com',
        city: String(shippingAddress?.city || ''),
        country: String(shippingAddress?.country || ''),
        deliveryDate,
        estimatedDeliveryDate: deliveryDate,
        notes: notes || '',
        // Store address fields in the format expected by the schema
        shippingAddress: JSON.stringify({
            fullName: shippingAddress?.fullName || user.name || '',
            address: shippingAddress?.address || (user.addresses && user.addresses.length > 0 ? user.addresses[0].addressLine1 : ''),
            city: shippingAddress?.city || (user.addresses && user.addresses.length > 0 ? user.addresses[0].city : ''),
            state: shippingAddress?.state || (user.addresses && user.addresses.length > 0 ? user.addresses[0].state : ''),
            postalCode: shippingAddress?.postalCode || (user.addresses && user.addresses.length > 0 ? user.addresses[0].postalCode : ''),
            country: shippingAddress?.country || (user.addresses && user.addresses.length > 0 ? user.addresses[0].country : ''),
            phone: shippingAddress?.phone || user.phone || ''
        }),
        billingAddress: JSON.stringify({
            fullName: billingAddress?.fullName || user.name || '',
            address: billingAddress?.address || (user.addresses && user.addresses.length > 0 ? user.addresses[0].addressLine1 : ''),
            city: billingAddress?.city || (user.addresses && user.addresses.length > 0 ? user.addresses[0].city : ''),
            state: billingAddress?.state || (user.addresses && user.addresses.length > 0 ? user.addresses[0].state : ''),
            postalCode: billingAddress?.postalCode || (user.addresses && user.addresses.length > 0 ? user.addresses[0].postalCode : ''),
            country: billingAddress?.country || (user.addresses && user.addresses.length > 0 ? user.addresses[0].country : ''),
            phone: billingAddress?.phone || user.phone || ''
        }),
        statusHistory: [{
            status: 'pending',
            date: new Date(),
            note: 'Order created'
        }]
    };

    // Create order in database
    const order = await orderService.createOrder(orderData);

    // Clear user's cart after successful order creation if we used the user's cart
    if (useCartFromUser) {
        user.cart = [];
        await user.save();
    }

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
    logger.info(`Processing webhook event: ${event.type}`);

    switch (event.type) {
        // Payment Intent Events
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

                    logger.info(`Updated order ${orderNumber} to paid status`);
                } else {
                    logger.error(`Order not found for payment intent ${paymentIntent.id}`);
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

                    logger.info(`Updated order ${orderNumber} to failed payment status`);
                }
            }
            break;
        }

        // Checkout Session Events
        case 'checkout.session.completed': {
            const session = event.data.object;
            const orderNumber = session.metadata?.orderNumber;

            if (orderNumber) {
                const order = await orderService.getOrderByNumber(orderNumber);

                if (order) {
                    await orderService.updateOrderById(order._id, {
                        paymentStatus: session.payment_status === 'paid' ? 'paid' : 'pending',
                        status: session.payment_status === 'paid' ? 'processing' : 'pending',
                        statusHistory: [
                            ...order.statusHistory,
                            {
                                status: session.payment_status === 'paid' ? 'processing' : 'pending',
                                date: new Date(),
                                note: `Checkout session completed: ${session.payment_status}`
                            }
                        ]
                    });

                    logger.info(`Updated order ${orderNumber} based on completed checkout session`);
                }
            }
            break;
        }

        case 'checkout.session.async_payment_succeeded': {
            const session = event.data.object;
            const orderNumber = session.metadata?.orderNumber;

            if (orderNumber) {
                const order = await orderService.getOrderByNumber(orderNumber);

                if (order) {
                    await orderService.updateOrderById(order._id, {
                        paymentStatus: 'paid',
                        status: 'processing',
                        statusHistory: [
                            ...order.statusHistory,
                            {
                                status: 'processing',
                                date: new Date(),
                                note: 'Async payment succeeded'
                            }
                        ]
                    });

                    logger.info(`Updated order ${orderNumber} to paid status from async payment`);
                }
            }
            break;
        }

        case 'checkout.session.async_payment_failed': {
            const session = event.data.object;
            const orderNumber = session.metadata?.orderNumber;

            if (orderNumber) {
                const order = await orderService.getOrderByNumber(orderNumber);

                if (order) {
                    await orderService.updateOrderById(order._id, {
                        paymentStatus: 'failed',
                        statusHistory: [
                            ...order.statusHistory,
                            {
                                status: 'pending',
                                date: new Date(),
                                note: 'Async payment failed'
                            }
                        ]
                    });

                    logger.info(`Updated order ${orderNumber} to failed payment status from async payment`);
                }
            }
            break;
        }

        case 'checkout.session.expired': {
            const session = event.data.object;
            const orderNumber = session.metadata?.orderNumber;

            if (orderNumber) {
                const order = await orderService.getOrderByNumber(orderNumber);

                if (order) {
                    await orderService.updateOrderById(order._id, {
                        paymentStatus: 'failed',
                        status: 'cancelled',
                        statusHistory: [
                            ...order.statusHistory,
                            {
                                status: 'cancelled',
                                date: new Date(),
                                note: 'Payment session expired'
                            }
                        ]
                    });

                    logger.info(`Updated order ${orderNumber} to cancelled status due to expired session`);
                }
            }
            break;
        }

        default:
            // Handle other event types as needed
            logger.info(`Unhandled Stripe event type: ${event.type}`);
    }
};

/**
 * Process a payment using the specified payment method
 * @param {Object} paymentData - Payment data
 * @returns {Promise<Object>} - Payment result
 */
const processPayment = async (paymentData) => {
    const { amount, paymentMethod, cardDetails, userId, description } = paymentData;

    logger.info(`Processing payment: ${amount} via ${paymentMethod} for user ${userId}`);

    // In production, this would call the payment processor API
    // For now, validate basic card data and return a simulated response
    if (!cardDetails || !cardDetails.number) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid card details');
    }

    // Basic validation for demonstration
    const cardNumber = cardDetails.number.replace(/\s/g, '');
    if (cardNumber.length !== 16) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Card number must be 16 digits');
    }

    // Simulate a payment processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Test card numbers that will succeed (same as frontend)
    const testCards = ["4242424242424242", "5555555555554444", "4111111111111111"];

    if (!testCards.includes(cardNumber)) {
        throw new ApiError(httpStatus.PAYMENT_REQUIRED, 'Card declined');
    }

    // Simulate successful payment
    return {
        id: `pay_${Math.random().toString(36).substring(2, 15)}`,
        amount,
        status: 'succeeded',
        paymentMethod,
        created: Date.now(),
        description
    };
};

/**
 * Process a checkout payment for an order
 * @param {string} orderId - Order ID
 * @param {string} paymentMethod - Payment method ID or type
 * @param {number} amount - Amount to charge
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Payment result
 */
const processCheckoutPayment = async (orderId, paymentMethod, amount, userId) => {
    logger.info(`Processing checkout payment for order: ${orderId}`);

    // In production, this would validate the order and call the payment processor
    // For now, return a simulated payment response
    return {
        success: true,
        orderId,
        paymentId: `pay_${Math.random().toString(36).substring(2, 15)}`,
        amount,
        status: 'completed',
        transactionDate: new Date().toISOString()
    };
};

/**
 * Process webhook events from payment providers like Stripe
 * @param {Object} event - Webhook event data
 * @returns {Promise<void>}
 */
const processWebhookEvent = async (event) => {
    logger.info(`Processing webhook event: ${event.type}`);

    // Handle different event types from payment providers
    switch (event.type) {
        case 'payment_intent.succeeded':
            // Update relevant order/subscription status
            logger.info(`Payment succeeded: ${event.data?.id}`);
            break;

        case 'payment_intent.payment_failed':
            logger.warn(`Payment failed: ${event.data?.id}`);
            break;

        case 'charge.refunded':
            logger.info(`Payment refunded: ${event.data?.id}`);
            break;

        default:
            logger.info(`Unhandled webhook event type: ${event.type}`);
    }
};

module.exports = {
    createPaymentIntent,
    processCheckout,
    handleStripeWebhook,
    processPayment,
    processCheckoutPayment,
    processWebhookEvent
};