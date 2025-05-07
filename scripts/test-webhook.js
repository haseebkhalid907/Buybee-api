/**
 * Stripe Webhook Tester
 * This script helps test webhook event handling without needing real payments
 * Run with: node test-webhook.js
 */

const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

// Configuration
const WEBHOOK_URL = process.env.STRIPE_WEBHOOK_URL || 'https://16cnzzrr-3000.inc1.devtunnels.ms/v1/payments/webhook';
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_2c';

// Sample order data for testing
const sampleOrder = {
    orderNumber: `TEST-${Date.now()}`,
    amount: 9999, // $99.99
};

// Create test events for different scenarios
const testEvents = [
    {
        type: 'payment_intent.succeeded',
        data: {
            object: {
                id: `pi_test_${Date.now()}`,
                object: 'payment_intent',
                amount: sampleOrder.amount,
                currency: 'usd',
                status: 'succeeded',
                payment_method_details: {
                    card: {
                        last4: '4242'
                    }
                },
                metadata: {
                    orderNumber: sampleOrder.orderNumber
                },
                receipt_url: 'https://pay.stripe.com/receipts/test'
            }
        }
    },
    {
        type: 'payment_intent.payment_failed',
        data: {
            object: {
                id: `pi_test_failed_${Date.now()}`,
                object: 'payment_intent',
                amount: sampleOrder.amount,
                currency: 'usd',
                status: 'failed',
                last_payment_error: {
                    message: 'Your card was declined.'
                },
                metadata: {
                    orderNumber: sampleOrder.orderNumber
                }
            }
        }
    },
    {
        type: 'checkout.session.completed',
        data: {
            object: {
                id: `cs_test_${Date.now()}`,
                object: 'checkout.session',
                payment_status: 'paid',
                amount_total: sampleOrder.amount,
                currency: 'usd',
                customer_details: {
                    email: 'test@example.com',
                    name: 'Test Customer'
                },
                metadata: {
                    orderNumber: sampleOrder.orderNumber
                }
            }
        }
    },
    {
        type: 'checkout.session.async_payment_succeeded',
        data: {
            object: {
                id: `cs_test_async_${Date.now()}`,
                object: 'checkout.session',
                payment_status: 'paid',
                amount_total: sampleOrder.amount,
                currency: 'usd',
                customer_details: {
                    email: 'test@example.com',
                    name: 'Test Customer'
                },
                metadata: {
                    orderNumber: sampleOrder.orderNumber
                }
            }
        }
    },
    {
        type: 'checkout.session.async_payment_failed',
        data: {
            object: {
                id: `cs_test_async_failed_${Date.now()}`,
                object: 'checkout.session',
                payment_status: 'failed',
                amount_total: sampleOrder.amount,
                currency: 'usd',
                customer_details: {
                    email: 'test@example.com',
                    name: 'Test Customer'
                },
                metadata: {
                    orderNumber: sampleOrder.orderNumber
                }
            }
        }
    },
    {
        type: 'checkout.session.expired',
        data: {
            object: {
                id: `cs_test_expired_${Date.now()}`,
                object: 'checkout.session',
                payment_status: 'unpaid',
                status: 'expired',
                amount_total: sampleOrder.amount,
                currency: 'usd',
                customer_details: {
                    email: 'test@example.com',
                    name: 'Test Customer'
                },
                metadata: {
                    orderNumber: sampleOrder.orderNumber
                }
            }
        }
    }
];

/**
 * Generate a Stripe signature for testing
 * @param {Object} payload - The webhook event payload
 * @param {String} secret - Webhook signing secret
 * @param {Number} timestamp - Timestamp to use in signature
 * @returns {String} - Stripe signature
 */
function generateStripeSignature(payload, secret, timestamp = Math.floor(Date.now() / 1000)) {
    const signedPayload = `${timestamp}.${JSON.stringify(payload)}`;
    const signature = crypto
        .createHmac('sha256', secret)
        .update(signedPayload)
        .digest('hex');

    return `t=${timestamp},v1=${signature}`;
}

/**
 * Send a test webhook to the server
 * @param {Object} event - Webhook event to send
 */
async function sendTestWebhook(event) {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = generateStripeSignature(event, WEBHOOK_SECRET, timestamp);

    console.log(`\n📬 Sending test webhook: ${event.type}`);
    console.log(`📝 Order: ${event.data.object.metadata.orderNumber}`);

    try {
        const response = await axios.post(WEBHOOK_URL, event, {
            headers: {
                'Content-Type': 'application/json',
                'Stripe-Signature': signature
            }
        });

        console.log(`✅ Response: ${response.status} ${JSON.stringify(response.data)}`);
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(`Response: ${JSON.stringify(error.response.data)}`);
        }
    }
}

/**
 * Run tests for all events sequentially
 */
async function runTests() {
    console.log('🧪 Starting Stripe webhook tests');
    console.log(`🔗 Target URL: ${WEBHOOK_URL}`);

    for (const event of testEvents) {
        await sendTestWebhook(event);
        // Wait a bit between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n🏁 All test webhooks sent!');
}

// Run the tests
runTests().catch(console.error);