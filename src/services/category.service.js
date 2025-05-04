const httpStatus = require('http-status');
const { Category } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a category
 * @param {Object} categoryBody
 * @returns {Promise<Category>}
 */
const createCategory = async (categoryBody) => {
    if (await Category.isNameTaken(categoryBody.name)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Category name already taken');
    }

    // Create slug from name if not provided
    if (!categoryBody.slug) {
        categoryBody.slug = Category.createSlug(categoryBody.name);
    }

    if (await Category.isSlugTaken(categoryBody.slug)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Category slug already taken');
    }

    return Category.create(categoryBody);
};

/**
 * Query for categories
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryCategories = async (filter, options) => {
    const categories = await Category.paginate(filter, options);
    return categories;
};

/**
 * Get category by id
 * @param {ObjectId} id
 * @returns {Promise<Category>}
 */
const getCategoryById = async (id) => {
    return Category.findById(id);
};

/**
 * Update category by id
 * @param {ObjectId} categoryId
 * @param {Object} updateBody
 * @returns {Promise<Category>}
 */
const updateCategoryById = async (categoryId, updateBody) => {
    const category = await getCategoryById(categoryId);
    if (!category) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
    }

    if (updateBody.name && (await Category.isNameTaken(updateBody.name, categoryId))) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Category name already taken');
    }

    // Update slug if name is updated
    if (updateBody.name && !updateBody.slug) {
        updateBody.slug = Category.createSlug(updateBody.name);
    }

    if (updateBody.slug && (await Category.isSlugTaken(updateBody.slug, categoryId))) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Category slug already taken');
    }

    Object.assign(category, updateBody);
    await category.save();
    return category;
};

/**
 * Delete category by id
 * @param {ObjectId} categoryId
 * @returns {Promise<Category>}
 */
const deleteCategoryById = async (categoryId) => {
    const category = await getCategoryById(categoryId);
    if (!category) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
    }

    // Check if category has children
    const hasChildren = await Category.exists({ parent: categoryId });
    if (hasChildren) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot delete category with subcategories');
    }

    await category.remove();
    return category;
};

module.exports = {
    createCategory,
    queryCategories,
    getCategoryById,
    updateCategoryById,
    deleteCategoryById,
};