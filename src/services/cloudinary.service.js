const { cloudinary } = require('../config/cloudinary');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');
const fs = require('fs');
const path = require('path');

/**
 * Upload file to Cloudinary
 * @param {string|Buffer} file - File path or buffer to upload
 * @param {Object} options - Cloudinary upload options
 * @returns {Promise<Object>} - Cloudinary upload result
 */
const uploadToCloudinary = async (file, options = {}) => {
    try {
        // Default options
        const uploadOptions = {
            resource_type: 'auto',
            folder: 'buybee',
            ...options,
        };

        const result = await cloudinary.uploader.upload(file, uploadOptions);
        return result;
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new ApiError(httpStatus.BAD_REQUEST, 'Error uploading image to Cloudinary');
    }
};

/**
 * Upload multiple files to Cloudinary
 * @param {Array<string|Buffer>} files - Array of file paths or buffers
 * @param {Object} options - Cloudinary upload options
 * @returns {Promise<Array<Object>>} - Array of Cloudinary upload results
 */
const uploadMultipleToCloudinary = async (files, options = {}) => {
    try {
        const uploadPromises = files.map((file) => uploadToCloudinary(file, options));
        return await Promise.all(uploadPromises);
    } catch (error) {
        console.error('Cloudinary multiple upload error:', error);
        throw new ApiError(httpStatus.BAD_REQUEST, 'Error uploading multiple images to Cloudinary');
    }
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Public ID of the file to delete
 * @param {Object} options - Cloudinary delete options
 * @returns {Promise<Object>} - Cloudinary delete result
 */
const deleteFromCloudinary = async (publicId, options = {}) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId, options);
        return result;
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        throw new ApiError(httpStatus.BAD_REQUEST, 'Error deleting image from Cloudinary');
    }
};

/**
 * Generate a Cloudinary URL with transformations
 * @param {string} publicId - Public ID of the image
 * @param {Object} transformations - Image transformations
 * @returns {string} - Transformed image URL
 */
const getImageUrl = (publicId, transformations = {}) => {
    const defaultTransformations = {
        fetch_format: 'auto',
        quality: 'auto',
    };

    return cloudinary.url(publicId, {
        ...defaultTransformations,
        ...transformations,
    });
};

/**
 * Upload files from Multer middleware to Cloudinary and remove from server
 * @param {Array<Object>} files - Files from Multer middleware
 * @param {Object} options - Cloudinary upload options
 * @returns {Promise<Array<string>>} - Array of Cloudinary URLs
 */
const uploadMulterFilesToCloudinary = async (files, options = {}) => {
    try {
        const uploadPromises = files.map(async (file) => {
            // Upload file to Cloudinary
            const result = await uploadToCloudinary(file.path, options);

            // Remove local file
            fs.unlink(file.path, (err) => {
                if (err) console.error('Error removing local file:', err);
            });

            // Return the Cloudinary URL
            return result.secure_url;
        });

        return await Promise.all(uploadPromises);
    } catch (error) {
        console.error('Cloudinary Multer upload error:', error);
        throw new ApiError(httpStatus.BAD_REQUEST, 'Error uploading images to Cloudinary');
    }
};

module.exports = {
    uploadToCloudinary,
    uploadMultipleToCloudinary,
    deleteFromCloudinary,
    getImageUrl,
    uploadMulterFilesToCloudinary,
};
