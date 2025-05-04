// Set NODE_ENV before requiring config
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const mongoose = require('mongoose');
const config = require('../config/config');
const logger = require('../config/logger');

// Import models
const { User, Category, Product, Order } = require('../models');

// Import seeder data files
const userData = require('./data/users.seed');
const categoryData = require('./data/categories.seed');
const productData = require('./data/products.seed');
const orderData = require('./data/orders.seed');

/**
 * Clear all collections in the database
 */
const clearDatabase = async () => {
    logger.info('Clearing database collections...');

    // await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});

    logger.info('Database cleared!');
};

/**
 * Import seed data into the database
 */
const importData = async () => {
    try {
        // Connect to database
        await mongoose.connect(config.mongoose.url, config.mongoose.options);
        logger.info('Connected to MongoDB');

        // Clear the database first if requested
        if (process.argv.includes('--clear')) {
            await clearDatabase();
        }

        // Import categories first (products depend on them)
        logger.info('Importing categories...');
        const categories = await Category.insertMany(categoryData);
        logger.info(`${categories.length} categories imported`);

        // Import users (including buyers and sellers)
        logger.info('Importing users...');
        const users = await User.insertMany(userData);
        logger.info(`${users.length} users imported`);

        // Import products (map categories and users to the imported ones)
        logger.info('Importing products...');
        const productDataMapped = productData.map(product => {
            // Find the actual IDs from the imported data
            // This assumes the seed data has unique identifiers you can match against
            const categoryObj = categories.find(c => c.slug === product.categorySlug);
            const sellerObj = users.find(u => u.email === product.sellerEmail);

            // Replace placeholder values with actual database IDs
            return {
                ...product,
                category: categoryObj._id,
                seller: sellerObj._id,
                // Remove temporary mapping fields
                categorySlug: undefined,
                sellerEmail: undefined
            };
        });

        const products = await Product.insertMany(productDataMapped);
        logger.info(`${products.length} products imported`);

        // Import orders (map users and products to the imported ones)
        logger.info('Importing orders...');
        const orderDataMapped = orderData.map(order => {
            // Find the actual user ID from the imported data
            const customerObj = users.find(u => u.email === order.customerEmail);

            // Map each order item to include actual product and seller IDs
            const items = order.items.map(item => {
                const productObj = products.find(p => p.name === item.productName);
                const sellerObj = users.find(u => u.email === item.sellerEmail);

                return {
                    product: productObj._id,
                    quantity: item.quantity,
                    price: item.price,
                    seller: sellerObj._id
                };
            });

            // Replace placeholder values with actual database IDs
            return {
                ...order,
                customer: customerObj._id,
                items,
                // Remove temporary mapping fields
                customerEmail: undefined,
                items: items
            };
        });

        const orders = await Order.insertMany(orderDataMapped);
        logger.info(`${orders.length} orders imported`);

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

// Execute import function
importData();