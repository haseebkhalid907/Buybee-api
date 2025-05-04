// Set NODE_ENV before requiring config
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/config');
const logger = require('../config/logger');

// Import models
const { User, Category, Product, Order } = require('../models');

/**
 * Simple seeder for Buybee API
 * This seeder handles duplicate key errors by using upsert operations
 */
const runSeeder = async () => {
    try {
        // Connect to database
        await mongoose.connect(config.mongoose.url, config.mongoose.options);
        logger.info('Connected to MongoDB');

        // Clear the database first if requested
        if (process.argv.includes('--clear')) {
            logger.info('Clearing database collections...');
            // Use deleteMany to clear collections
            await Category.deleteMany({});
            await Product.deleteMany({});
            await Order.deleteMany({});
            // Don't delete users by default as they may be used by external systems
            logger.info('Database cleared!');
        }

        // Create admin user (using upsert to avoid duplicate key errors)
        logger.info('Creating users...');
        const hashedPassword = await bcrypt.hash('Password123', 8);

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
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        const seller = await User.findOneAndUpdate(
            { email: 'seller@buybee.com' },
            {
                name: 'Test Seller',
                email: 'seller@buybee.com',
                password: hashedPassword,
                role: 'seller',
                phone: '+12025550109',
                isEmailVerified: true,
                status: 'active',
                sellerProfile: {
                    storeName: 'Test Store',
                    storeDescription: 'This is a test store',
                    businessPhone: '+12025550109',
                    isVerified: true
                }
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        const buyer = await User.findOneAndUpdate(
            { email: 'buyer@buybee.com' },
            {
                name: 'Test Buyer',
                email: 'buyer@buybee.com',
                password: hashedPassword,
                role: 'buyer',
                phone: '+12025550110',
                isEmailVerified: true,
                status: 'active'
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        logger.info('Users created successfully');

        // Create categories (using upsert to avoid duplicate key errors)
        logger.info('Creating categories...');

        // Create parent categories first
        const electronics = await Category.findOneAndUpdate(
            { slug: 'electronics' },
            {
                name: 'Electronics',
                description: 'Electronic devices and accessories',
                slug: 'electronics',
                level: 1,
                image: 'https://picsum.photos/400/400?random=001',
                active: true,
                featured: true,
                order: 1
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        const clothing = await Category.findOneAndUpdate(
            { slug: 'clothing' },
            {
                name: 'Clothing',
                description: 'Apparel for men, women, and children',
                slug: 'clothing',
                level: 1,
                image: 'https://picsum.photos/400/400?random=002',
                active: true,
                featured: true,
                order: 2
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Create subcategories
        const smartphones = await Category.findOneAndUpdate(
            { slug: 'smartphones' },
            {
                name: 'Smartphones',
                description: 'Mobile phones and accessories',
                slug: 'smartphones',
                parent: electronics._id,
                level: 2,
                image: 'https://picsum.photos/400/400?random=003',
                active: true,
                order: 1
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        const laptops = await Category.findOneAndUpdate(
            { slug: 'laptops' },
            {
                name: 'Laptops',
                description: 'Portable computers for work and play',
                slug: 'laptops',
                parent: electronics._id,
                level: 2,
                image: 'https://picsum.photos/400/400?random=004',
                active: true,
                order: 2
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        const mensClothing = await Category.findOneAndUpdate(
            { slug: 'mens-clothing' },
            {
                name: "Men's Clothing",
                description: 'Clothing for men',
                slug: 'mens-clothing',
                parent: clothing._id,
                level: 2,
                image: 'https://picsum.photos/400/400?random=005.jpg',
                active: true,
                order: 1
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        logger.info('Categories created successfully');

        // Create products without using the slug field
        logger.info('Creating products...');

        // iPhone product
        const iphone = await Product.create({
            name: 'iPhone 13 Pro',
            description: 'Apple iPhone 13 Pro with 256GB storage and triple camera system.',
            price: 999.99,
            stock: 50,
            images: [
                'https://picsum.photos/400/400?random=006-pro-1.jpg',
                'https://picsum.photos/400/400?random=007-pro-2.jpg'
            ],
            category: smartphones._id,
            seller: seller._id,
            condition: 'new', // Required field
            specifications: {
                brand: 'Apple',
                model: 'iPhone 13 Pro',
                storage: '256GB',
                color: 'Graphite'
            },
            status: 'active',
            featured: true,
            tags: ['smartphone', 'apple', 'ios', 'iphone', 'mobile phone']
        }).catch(err => {
            if (err.code === 11000) {
                // If duplicate key error, find the product instead
                return Product.findOne({ name: 'iPhone 13 Pro' });
            }
            throw err;
        });

        // Laptop product
        const macbook = await Product.create({
            name: 'MacBook Pro 14"',
            description: 'Apple MacBook Pro 14" with M1 Pro chip and 16GB unified memory.',
            price: 1999.99,
            stock: 25,
            images: [
                'https://picsum.photos/400/400?random=008-14-1.jpg',
                'https://picsum.photos/400/400?random=009-14-2.jpg'
            ],
            category: laptops._id,
            seller: seller._id,
            condition: 'new', // Required field
            specifications: {
                brand: 'Apple',
                model: 'MacBook Pro 14"',
                processor: 'Apple M1 Pro',
                memory: '16GB unified memory'
            },
            status: 'active',
            featured: true,
            tags: ['laptop', 'apple', 'macbook', 'macbook pro', 'computer']
        }).catch(err => {
            if (err.code === 11000) {
                // If duplicate key error, find the product instead
                return Product.findOne({ name: 'MacBook Pro 14"' });
            }
            throw err;
        });

        // Clothing product
        await Product.create({
            name: 'Classic Fit Oxford Shirt',
            description: 'Men\'s classic fit button-down oxford shirt in light blue.',
            price: 49.99,
            stock: 100,
            images: [
                'https://picsum.photos/400/400?random=010-1.jpg',
                'https://picsum.photos/400/400?random=011-2.jpg'
            ],
            category: mensClothing._id,
            seller: seller._id,
            condition: 'new', // Required field
            specifications: {
                brand: 'FashionBrand',
                material: '100% Cotton',
                color: 'Light Blue',
                fit: 'Classic Fit'
            },
            status: 'active',
            featured: false,
            tags: ['shirt', 'men', 'clothing', 'oxford', 'button-down']
        }).catch(err => {
            if (err.code === 11000) {
                // Ignore duplicate key errors
                logger.info('Shirt already exists, skipping');
            } else {
                throw err;
            }
        });

        logger.info('Products created successfully');

        // Create a sample order
        logger.info('Creating sample order...');

        // Generate order number with date and random string
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomStr = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const orderNumber = `ORD-${dateStr}-${randomStr}`;

        await Order.create({
            orderNumber,
            customer: buyer._id,
            items: [
                {
                    product: iphone._id,
                    quantity: 1,
                    price: 999.99,
                    seller: seller._id
                },
                {
                    product: macbook._id,
                    quantity: 1,
                    price: 1999.99,
                    seller: seller._id
                }
            ],
            status: 'processing',
            paymentMethod: 'credit_card',
            paymentStatus: 'paid',
            paymentDetails: {
                transactionId: 'TXN-12345',
                paymentDate: new Date(),
                cardLastFour: '4242'
            },
            subtotal: 2999.98,
            tax: 300.00,
            shippingCost: 15.00,
            discount: 0,
            total: 3314.98,
            shippingAddress: {
                fullName: 'Test Buyer',
                address: '123 Test St',
                city: 'Test City',
                state: 'Test State',
                postalCode: '12345',
                country: 'United States',
                phone: '+12025550110'
            },
            billingAddress: {
                fullName: 'Test Buyer',
                address: '123 Test St',
                city: 'Test City',
                state: 'Test State',
                postalCode: '12345',
                country: 'United States',
                phone: '+12025550110'
            },
            notes: 'This is a test order',
            statusHistory: [
                {
                    status: 'pending',
                    date: new Date(Date.now() - 86400000), // 1 day ago
                    note: 'Order created',
                    updatedBy: admin._id
                },
                {
                    status: 'processing',
                    date: new Date(),
                    note: 'Payment confirmed',
                    updatedBy: admin._id
                }
            ]
        }).catch(err => {
            if (err.code === 11000) {
                logger.info('Order already exists, skipping');
            } else {
                logger.error(`Error creating order: ${err.message}`);
            }
        });

        logger.info('Sample order created successfully');
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
runSeeder();