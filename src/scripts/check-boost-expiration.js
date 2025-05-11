/**
 * Script to check for expired product boosts
 * This should be run as a scheduled cronjob to automatically update the boost status
 */
const mongoose = require('mongoose');
const config = require('../config/config');
const logger = require('../config/logger');
const { Product } = require('../models');

/**
 * Check all products with active boosts and update if expired
 */
const checkBoostExpirations = async () => {
    try {
        // Connect to database
        await mongoose.connect(config.mongoose.url, config.mongoose.options);
        logger.info('Connected to MongoDB for boost expiration check');

        // Find products with active boosts 
        // where the boost end date is in the past
        const currentDate = new Date();

        const expiredBoosts = await Product.find({
            'boost.active': true,
            'boost.endDate': { $lt: currentDate }
        });

        logger.info(`Found ${expiredBoosts.length} products with expired boosts`);

        // Update each product with expired boost
        const updatePromises = expiredBoosts.map(async (product) => {
            logger.info(`Expiring boost for product: ${product.name} (${product._id || product.id})`);

            // Update the product
            product.boost.active = false;
            product.featured = false; // Remove featured status when boost expires

            // Save changes
            await product.save();

            return product._id || product.id;
        });

        // Wait for all updates to complete
        const updatedProductIds = await Promise.all(updatePromises);

        logger.info(`Successfully updated ${updatedProductIds.length} products with expired boosts`);

        // Disconnect from database
        await mongoose.disconnect();
        logger.info('Disconnected from MongoDB');

        return updatedProductIds;
    } catch (error) {
        logger.error(`Error checking boost expirations: ${error.message}`);

        // Ensure we disconnect from database even if there's an error
        try {
            await mongoose.disconnect();
            logger.info('Disconnected from MongoDB after error');
        } catch (disconnectError) {
            logger.error(`Error disconnecting from MongoDB: ${disconnectError.message}`);
        }

        throw error;
    }
};

// If this script is run directly (not imported)
if (require.main === module) {
    checkBoostExpirations()
        .then((updatedProductIds) => {
            logger.info(`Boost expiration check completed. Updated ${updatedProductIds.length} products.`);
            process.exit(0);
        })
        .catch((error) => {
            logger.error(`Boost expiration check failed: ${error.message}`);
            process.exit(1);
        });
}

module.exports = checkBoostExpirations;