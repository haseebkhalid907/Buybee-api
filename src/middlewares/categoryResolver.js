const { Category } = require('../models');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');

/**
 * Middleware to resolve category names to their ObjectIds
 * If category is provided as a string name instead of an ObjectId, 
 * this middleware will attempt to find the correct category ID
 */
const categoryResolver = async (req, res, next) => {
    try {
        // Only process if there's a category field that is a string but not a valid MongoDB ObjectId
        if (req.body.category && typeof req.body.category === 'string') {
            // Check if the string is already in ObjectId format
            const objectIdPattern = /^[0-9a-fA-F]{24}$/;

            if (!objectIdPattern.test(req.body.category)) {
                // It's not an ObjectId, so it's likely a category name
                // First try exact match
                let category = await Category.findOne({ name: req.body.category });

                // If not found, try case-insensitive search
                if (!category) {
                    category = await Category.findOne({
                        name: { $regex: new RegExp(`^${req.body.category}$`, 'i') }
                    });
                }

                // If found, replace the name with the ID
                if (category) {
                    req.body.category = category._id;
                } else {
                    throw new ApiError(
                        httpStatus.BAD_REQUEST,
                        `Category '${req.body.category}' not found. Please select a valid category.`
                    );
                }
            }
        }
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = categoryResolver;