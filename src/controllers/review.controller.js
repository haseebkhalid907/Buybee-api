const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { productService } = require('../services');

/**
 * Create a product review
 */
const createReview = catchAsync(async (req, res) => {
    const { productId } = req.params;
    const userId = req?.user?.id ? req.user.id : req?.user?._id;

    const product = await productService.getProductById(productId);

    if (!product) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
    }

    // Check if user already reviewed this product
    const existingReview = product.reviews.find(
        (review) => review.user && review.user.toString() === userId.toString()
    );

    if (existingReview) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'You have already reviewed this product');
    }

    const newReview = {
        user: userId,
        rating: req.body.rating,
        comment: req.body.comment,
        date: new Date(),
    };

    product.reviews.push(newReview);
    product.updateRating();

    await product.save();

    res.status(httpStatus.CREATED).send({
        id: product.reviews[product.reviews.length - 1]._id,
        user: userId,
        rating: req.body.rating,
        comment: req.body.comment,
        date: newReview.date,
    });
});

/**
 * Get all reviews for a specific product
 */
const getReviews = catchAsync(async (req, res) => {
    const { productId } = req.params;
    const product = await productService.getProductById(productId);

    if (!product) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
    }

    // Populate user information for reviews
    await product.populate({
        path: 'reviews.user',
        select: 'name email profileImage',
    });

    res.send(product.reviews);
});

/**
 * Update a product review
 */
const updateReview = catchAsync(async (req, res) => {
    const { productId, reviewId } = req.params;
    const userId = req?.user?.id ? req.user.id : req?.user?._id;

    const product = await productService.getProductById(productId);

    if (!product) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
    }

    // Find the review
    const reviewIndex = product.reviews.findIndex(
        (review) => review._id.toString() === reviewId.toString()
    );

    if (reviewIndex === -1) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Review not found');
    }

    // Check if user is the owner of the review
    if (product.reviews[reviewIndex].user.toString() !== userId.toString()) {
        throw new ApiError(httpStatus.FORBIDDEN, 'You can only update your own reviews');
    }

    // Update the review
    if (req.body.rating) {
        product.reviews[reviewIndex].rating = req.body.rating;
    }

    if (req.body.comment) {
        product.reviews[reviewIndex].comment = req.body.comment;
    }

    product.updateRating();

    await product.save();

    res.send(product.reviews[reviewIndex]);
});

/**
 * Delete a product review
 */
const deleteReview = catchAsync(async (req, res) => {
    const { productId, reviewId } = req.params;
    const userId = req?.user?.id ? req.user.id : req?.user?._id;

    const product = await productService.getProductById(productId);

    if (!product) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
    }

    // Find the review
    const reviewIndex = product.reviews.findIndex(
        (review) => review._id.toString() === reviewId.toString()
    );

    if (reviewIndex === -1) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Review not found');
    }

    // Check if user is the owner of the review or an admin
    if (product.reviews[reviewIndex].user.toString() !== userId.toString() &&
        req.user.role !== 'admin') {
        throw new ApiError(httpStatus.FORBIDDEN, 'You can only delete your own reviews');
    }

    // Remove the review
    product.reviews.splice(reviewIndex, 1);
    product.updateRating();

    await product.save();

    res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
    createReview,
    getReviews,
    updateReview,
    deleteReview,
};