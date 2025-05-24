const catchAsync = require('../utils/catchAsync');
const { cloudinaryService } = require('../services');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

/**
 * Upload multiple images to Cloudinary
 * @returns {Promise<Array<string>>} Array of Cloudinary image URLs
 */
const uploadImages = catchAsync(async (req, res) => {
    if (!req.files || req.files.length === 0) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'No files were uploaded');
    }

    const cloudinaryUrls = await cloudinaryService.uploadMulterFilesToCloudinary(req.files, {
        folder: 'buybee/products',
        transformation: [
            { width: 1200, crop: 'limit' },
            { fetch_format: 'auto', quality: 'auto' }
        ]
    });

    res.status(httpStatus.OK).json({
        success: true,
        message: 'Files uploaded successfully',
        images: cloudinaryUrls
    });
});

/**
 * Delete an image from Cloudinary
 */
const deleteImage = catchAsync(async (req, res) => {
    const { publicId } = req.body;

    if (!publicId) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Public ID is required');
    }

    const result = await cloudinaryService.deleteFromCloudinary(publicId);

    if (result.result !== 'ok') {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to delete image');
    }

    res.status(httpStatus.OK).json({
        success: true,
        message: 'Image deleted successfully'
    });
});

module.exports = {
    uploadImages,
    deleteImage
};
