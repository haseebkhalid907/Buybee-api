const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the appropriate .env file
dotenv.config({ path: path.join(__dirname, '../../.env.development') });

// Set NODE_ENV if not already set
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const config = require('../config/config');
const logger = require('../config/logger');
const User = require('../models/user.model');
const Category = require('../models/category.model');
const Product = require('../models/product.model');
const productData = require('./data/products.seed');
const categoriesData = require('./data/categories.seed');
const usersData = require('./data/users.seed');

// Parse command line arguments
const args = process.argv.slice(2);
const shouldClear = args.includes('--clear');

/**
 * Main seeding function
 */
const seed = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(config.mongoose.url, config.mongoose.options);
        logger.info('Connected to MongoDB for seeding data');

        // Clear existing data if --clear flag is provided or no flag is provided (default behavior)
        if (shouldClear) {
            logger.info('Clearing existing data...');
            await User.deleteMany({});
            await Category.deleteMany({});
            await Product.deleteMany({});
            logger.info('Existing data cleared successfully');
        }

        // Seed users
        logger.info('Seeding users...');
        const users = await User.insertMany(usersData);
        logger.info(`${users.length} users seeded successfully`);

        // Create a map of email to user IDs for easier reference
        const userMap = users.reduce((acc, user) => {
            acc[user.email] = user._id;
            return acc;
        }, {});

        // Seed categories
        logger.info('Seeding categories...');
        const categories = await seedCategories(categoriesData);
        logger.info(`${categories.length} categories seeded successfully`);

        // Create a map of category slugs to IDs
        const categoryMap = categories.reduce((acc, category) => {
            acc[category.slug] = category._id;
            return acc;
        }, {});

        // Seed products with reviews
        logger.info('Seeding products and reviews...');
        const products = await seedProductsWithReviews(productData, userMap, categoryMap);
        logger.info(`${products.length} products seeded successfully`);

        logger.info('Seeding completed successfully');
        mongoose.disconnect();
        return { users, categories, products };
    } catch (error) {
        logger.error(`Error seeding data: ${error.message}`);
        mongoose.disconnect();
        process.exit(1);
    }
};

/**
 * Seed categories and establish parent-child relationships
 */
const seedCategories = async (categoriesData) => {
    // First pass: Create all categories without parent references
    const categoriesFirstPass = await Promise.all(
        categoriesData.map(async (category) => {
            const { parent, ...categoryData } = category;
            return await Category.create(categoryData);
        })
    );

    // Create a map of slugs to category IDs
    const categoryMap = categoriesFirstPass.reduce((acc, category) => {
        acc[category.slug] = category._id;
        return acc;
    }, {});

    // Second pass: Update parent references
    await Promise.all(
        categoriesData.map(async (categoryData, index) => {
            if (categoryData.parent) {
                // Get the parent slug from original data
                const parentSlug = categoriesData.find(
                    (cat) => cat.name === categoryData.parent
                )?.slug;

                if (parentSlug && categoryMap[parentSlug]) {
                    await Category.findByIdAndUpdate(
                        categoriesFirstPass[index]._id,
                        { parent: categoryMap[parentSlug] }
                    );
                }
            }
        })
    );

    // Return all categories with updated parent references
    return await Category.find({});
};

/**
 * Seed products with reviews
 */
const seedProductsWithReviews = async (productData, userMap, categoryMap) => {
    // Process each product
    const products = await Promise.all(
        productData.map(async (productItem) => {
            // Map category slug to category ID
            const { categorySlug, sellerEmail, reviewsData, ...productDetails } = productItem;

            // Get category ID from slug
            const category = categoryMap[categorySlug];
            if (!category) {
                logger.warn(`Category with slug ${categorySlug} not found`);
            }

            // Get seller ID from email
            const seller = userMap[sellerEmail];
            if (!seller) {
                logger.warn(`Seller with email ${sellerEmail} not found`);
            }

            // Create basic product without reviews
            const product = await Product.create({
                ...productDetails,
                category: category || undefined,
                seller: seller || undefined
            });

            // Add reviews if available
            if (reviewsData && reviewsData.length > 0) {
                const processedReviews = reviewsData.map(review => {
                    const userId = userMap[review.userEmail];

                    if (!userId) {
                        logger.warn(`User with email ${review.userEmail} not found for review`);
                        return null;
                    }

                    return {
                        user: userId,
                        rating: review.rating,
                        comment: review.comment,
                        date: review.date
                    };
                }).filter(review => review !== null);

                // Add reviews to product
                if (processedReviews.length > 0) {
                    product.reviews = processedReviews;
                    product.updateRating();
                    await product.save();
                }
            }

            return product;
        })
    );

    return products;
};

// Only run seed if this script is executed directly (not imported)
if (require.main === module) {
    seed();
}

module.exports = seed;