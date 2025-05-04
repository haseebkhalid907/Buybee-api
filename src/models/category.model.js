const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const categorySchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        description: {
            type: String,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        parent: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'Category',
            default: null,
        },
        image: {
            type: String,
        },
        level: {
            type: Number,
            default: 1,
        },
        active: {
            type: Boolean,
            default: true,
        },
        order: {
            type: Number,
            default: 0,
        },
        featured: {
            type: Boolean,
            default: false,
        }
    },
    {
        timestamps: true,
    }
);

// add plugin that converts mongoose to json
categorySchema.plugin(toJSON);
categorySchema.plugin(paginate);

/**
 * Check if category name is taken
 * @param {string} name - The category name
 * @param {ObjectId} [excludeCategoryId] - The id of the category to be excluded
 * @returns {Promise<boolean>}
 */
categorySchema.statics.isNameTaken = async function (name, excludeCategoryId) {
    const category = await this.findOne({ name, _id: { $ne: excludeCategoryId } });
    return !!category;
};

/**
 * Check if category slug is taken
 * @param {string} slug - The category slug
 * @param {ObjectId} [excludeCategoryId] - The id of the category to be excluded
 * @returns {Promise<boolean>}
 */
categorySchema.statics.isSlugTaken = async function (slug, excludeCategoryId) {
    const category = await this.findOne({ slug, _id: { $ne: excludeCategoryId } });
    return !!category;
};

/**
 * Create a slug from the category name
 * @param {string} name - The category name
 * @returns {string} - The slug
 */
categorySchema.statics.createSlug = function (name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
};

/**
 * @typedef Category
 */
const Category = mongoose.model('Category', categorySchema);

module.exports = Category;