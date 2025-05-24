const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { cloudinaryService } = require('../services');

/**
 * Middleware to process uploaded files and upload to Cloudinary
 */
const uploadToCloudinary = () => async (req, res, next) => {
    try {
        // Skip if no files were uploaded
        if (!req.files || req.files.length === 0) {
            return next();
        }

        // Upload files to Cloudinary with optimization
        const cloudinaryUrls = await cloudinaryService.uploadMulterFilesToCloudinary(req.files, {
            folder: 'buybee/products',
            transformation: [
                { width: 1200, crop: 'limit' }, // Resize to max width 1200px
                { fetch_format: 'auto', quality: 'auto' } // Auto format and quality
            ]
        });

        // Add Cloudinary URLs to request body
        req.body.images = cloudinaryUrls;

        next();
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        return next(new ApiError(httpStatus.BAD_REQUEST, 'Error processing images'));
    }
};

module.exports = uploadToCloudinary;
