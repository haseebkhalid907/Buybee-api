// Set NODE_ENV before requiring config
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/config');
const logger = require('../config/logger');

// Import models
const { User, Category, Product, Order } = require('../models');

/**
 * Minimal seeder for Buybee API
 * This seeder contains only essential data and has been simplified to avoid schema issues
 */
const runMinimalSeeder = async () => {
    try {
        // Connect to database
        await mongoose.connect(config.mongoose.url, config.mongoose.options);
        logger.info('Connected to MongoDB');

        // Clear the database first if requested
        if (process.argv.includes('--clear')) {
            logger.info('Clearing database collections...');
            await Category.deleteMany({});
            await Product.deleteMany({});
            await Order.deleteMany({});
            // Don't delete users by default as they may be used by external systems
            logger.info('Database cleared!');
        }

        // Create basic users
        logger.info('Creating basic users...');
        const hashedPassword = await bcrypt.hash('Password123', 8);

        // Admin
        const admin = await User.findOneAndUpdate(
            { email: 'admin@buybee.com' },
            {
                name: 'Admin User',
                email: 'admin@buybee.com',
                password: hashedPassword,
                role: 'admin',
                phone: '+12025550108',
                isEmailVerified: true,
                status: 'active'
            },
            { upsert: true, new: true }
        );

        // Seller
        const seller = await User.findOneAndUpdate(
            { email: 'seller@buybee.com' },
            {
                name: 'Test Seller',
                email: 'seller@buybee.com',
                password: hashedPassword,
                role: 'seller',
                phone: '+12025550109',
                isEmailVerified: true,
                status: 'active'
            },
            { upsert: true, new: true }
        );

        // Buyer
        const buyer = await User.findOneAndUpdate(
            { email: 'buyer@buybee.com' },
            {
                name: 'Test Buyer',
                email: 'buyer@buybee.com',
                password: hashedPassword,
                role: 'user', // Use 'user' instead of 'buyer' if that's your role name
                phone: '+12025550110',
                isEmailVerified: true,
                status: 'active'
            },
            { upsert: true, new: true }
        );

        logger.info('Basic users created successfully');

        // Create basic categories
        logger.info('Creating basic categories...');

        // Parent category
        const electronics = await Category.findOneAndUpdate(
            { slug: 'electronics' },
            {
                name: 'Electronics',
                description: 'Electronic devices and accessories',
                slug: 'electronics',
                level: 1,
                image: 'https://picsum.photos/400/400?random=101',
                active: true,
                featured: true,
                order: 1
            },
            { upsert: true, new: true }
        );

        // Subcategory
        const smartphones = await Category.findOneAndUpdate(
            { slug: 'smartphones' },
            {
                name: 'Smartphones',
                description: 'Mobile phones and accessories',
                slug: 'smartphones',
                parent: electronics._id,
                level: 2,
                image: 'https://picsum.photos/400/400?random=102',
                active: true,
                order: 1
            },
            { upsert: true, new: true }
        );

        logger.info('Basic categories created successfully');

        // Create a basic product
        logger.info('Creating a basic product...');

        // Try to find existing product first
        let iphone = await Product.findOne({ name: 'iPhone 13 Pro' });

        // If not found, create it
        if (!iphone) {
            iphone = await Product.create({
                name: 'iPhone 13 Pro',
                description: 'Apple iPhone 13 Pro with 256GB storage.',
                price: 999.99,
                stock: 50,
                category: smartphones._id,
                seller: seller._id,
                condition: 'new',
                images: [
                    'https://picsum.photos/400/400?random=301',
                    'https://picsum.photos/400/400?random=302'
                ],
                status: 'active',
                featured: true,
            }).catch(err => {
                logger.error(`Error creating product: ${err.message}`);
                return null;
            });
        }

        logger.info('Basic product created successfully');

        // Create a basic order using the actual Order schema
        logger.info('Creating a basic order...');

        if (iphone) {
            // Generate unique order number
            const orderNumber = `BUY-${Date.now().toString().slice(-6)}`;

            try {
                await Order.create({
                    orderNumber: orderNumber,
                    firstName: 'Test',
                    lastName: 'Buyer',
                    email: buyer.email,
                    phone: buyer.phone,
                    country: 'USA',
                    city: 'Test City',
                    customer: buyer._id,
                    items: [
                        {
                            product: iphone._id,
                            quantity: 1,
                            price: 999.99
                        }
                    ],
                    totalAmount: 1099.99, // price + shipping
                    shippingCharges: 100.00,
                    status: 'pending',
                    deliveryDate: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)), // 7 days from now
                    shippingAddress: 'Test Address, Test City',
                    billingAddress: 'Test Address, Test City',
                    paymentMethod: 'credit_card', // Added required field
                    paymentStatus: 'paid'         // Added for completeness
                });

                logger.info('Basic order created successfully');
            } catch (err) {
                logger.error(`Error creating order: ${err.message}`);
            }
        }

        logger.info('Seeding completed successfully!');

        // Disconnect from the database
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        logger.error(`Error seeding data: ${error}`);
        await mongoose.disconnect();
        process.exit(1);
    }
};

// Execute seeder function
runMinimalSeeder();