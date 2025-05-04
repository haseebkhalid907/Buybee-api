/**
 * Order seed data
 * Note: customer, products and sellers will be populated by the seeder with actual MongoDB ObjectIds
 */
module.exports = [
    {
        orderNumber: 'BUY-000001',
        customerEmail: 'john@example.com', // Will be replaced with actual customer ID in seeder
        orderDate: new Date('2025-04-01'),
        status: 'delivered',
        items: [
            {
                productName: 'iPhone 13 Pro', // Will be replaced with actual product ID in seeder
                quantity: 1,
                price: 999.99,
                sellerEmail: 'tech@buybee.com' // Will be replaced with actual seller ID in seeder
            },
            {
                productName: 'Stainless Steel Kitchen Knife Set', // Will be replaced with actual product ID in seeder
                quantity: 1,
                price: 129.99,
                sellerEmail: 'homedecor@buybee.com' // Will be replaced with actual seller ID in seeder
            }
        ],
        shippingAddress: {
            name: 'John Smith',
            addressLine1: '123 Main Street',
            city: 'Anytown',
            state: 'CA',
            country: 'USA',
            postalCode: '12345',
            phone: '+1456789012'
        },
        billingAddress: {
            name: 'John Smith',
            addressLine1: '123 Main Street',
            city: 'Anytown',
            state: 'CA',
            country: 'USA',
            postalCode: '12345',
            phone: '+1456789012'
        },
        paymentMethod: {
            type: 'credit_card',
            last4: '1234',
            expiryMonth: 12,
            expiryYear: 25,
            cardHolder: 'John Smith'
        },
        shippingMethod: {
            carrier: 'FedEx',
            method: 'Ground',
            trackingNumber: 'FDX123456789',
            estimatedDelivery: new Date('2025-04-05'),
            cost: 12.99
        },
        subtotal: 1129.98,
        tax: 93.22,
        shippingCost: 12.99,
        discount: 0,
        total: 1236.19,
        notes: 'Please leave at front door',
        history: [
            {
                status: 'created',
                timestamp: new Date('2025-04-01T09:30:00'),
                note: 'Order placed'
            },
            {
                status: 'processing',
                timestamp: new Date('2025-04-01T10:15:00'),
                note: 'Payment confirmed'
            },
            {
                status: 'shipped',
                timestamp: new Date('2025-04-02T14:20:00'),
                note: 'Order shipped via FedEx'
            },
            {
                status: 'delivered',
                timestamp: new Date('2025-04-05T11:45:00'),
                note: 'Package delivered'
            }
        ]
    },
    {
        orderNumber: 'BUY-000002',
        customerEmail: 'jane@example.com', // Will be replaced with actual customer ID in seeder
        orderDate: new Date('2025-04-15'),
        status: 'shipped',
        items: [
            {
                productName: 'Floral Summer Dress', // Will be replaced with actual product ID in seeder
                quantity: 1,
                price: 59.99,
                sellerEmail: 'fashion@buybee.com' // Will be replaced with actual seller ID in seeder
            },
            {
                productName: 'Classic Fit Oxford Shirt', // Will be replaced with actual product ID in seeder
                quantity: 2,
                price: 49.99,
                sellerEmail: 'fashion@buybee.com' // Will be replaced with actual seller ID in seeder
            }
        ],
        shippingAddress: {
            name: 'Jane Doe',
            addressLine1: '789 Apartment Building',
            addressLine2: 'Apt 42',
            city: 'Metropolis',
            state: 'NY',
            country: 'USA',
            postalCode: '54321',
            phone: '+13334445555'
        },
        billingAddress: {
            name: 'Jane Doe',
            addressLine1: '789 Apartment Building',
            addressLine2: 'Apt 42',
            city: 'Metropolis',
            state: 'NY',
            country: 'USA',
            postalCode: '54321',
            phone: '+13334445555'
        },
        paymentMethod: {
            type: 'paypal',
            email: 'jane@example.com',
            transactionId: 'PP12345678'
        },
        shippingMethod: {
            carrier: 'UPS',
            method: '2-Day',
            trackingNumber: 'UPS987654321',
            estimatedDelivery: new Date('2025-04-18'),
            cost: 14.99
        },
        subtotal: 159.97,
        tax: 13.20,
        shippingCost: 14.99,
        discount: 15.99,
        total: 172.17,
        notes: '',
        history: [
            {
                status: 'created',
                timestamp: new Date('2025-04-15T15:22:00'),
                note: 'Order placed'
            },
            {
                status: 'processing',
                timestamp: new Date('2025-04-15T15:25:00'),
                note: 'Payment confirmed via PayPal'
            },
            {
                status: 'shipped',
                timestamp: new Date('2025-04-16T09:40:00'),
                note: 'Order shipped via UPS'
            }
        ]
    },
    {
        orderNumber: 'BUY-000003',
        customerEmail: 'john@example.com', // Will be replaced with actual customer ID in seeder
        orderDate: new Date('2025-05-02'),
        status: 'processing',
        items: [
            {
                productName: 'MacBook Pro 14"', // Will be replaced with actual product ID in seeder
                quantity: 1,
                price: 1999.99,
                sellerEmail: 'tech@buybee.com' // Will be replaced with actual seller ID in seeder
            }
        ],
        shippingAddress: {
            name: 'John Smith',
            addressLine1: '123 Main Street',
            city: 'Anytown',
            state: 'CA',
            country: 'USA',
            postalCode: '12345',
            phone: '+1456789012'
        },
        billingAddress: {
            name: 'John Smith',
            addressLine1: '123 Main Street',
            city: 'Anytown',
            state: 'CA',
            country: 'USA',
            postalCode: '12345',
            phone: '+1456789012'
        },
        paymentMethod: {
            type: 'credit_card',
            last4: '5678',
            expiryMonth: 11,
            expiryYear: 26,
            cardHolder: 'John Smith'
        },
        shippingMethod: {
            carrier: 'FedEx',
            method: 'Express',
            trackingNumber: '',
            estimatedDelivery: new Date('2025-05-05'),
            cost: 24.99
        },
        subtotal: 1999.99,
        tax: 165.00,
        shippingCost: 24.99,
        discount: 100.00,
        total: 2089.98,
        notes: 'Signature required for delivery',
        history: [
            {
                status: 'created',
                timestamp: new Date('2025-05-02T16:40:00'),
                note: 'Order placed'
            },
            {
                status: 'processing',
                timestamp: new Date('2025-05-02T16:42:00'),
                note: 'Payment confirmed'
            }
        ]
    }
];