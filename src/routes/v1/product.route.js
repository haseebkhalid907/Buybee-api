const express = require('express');
const validate = require('../../middlewares/validate');
const productValidation = require('../../validations/product.validation');
const reviewValidation = require('../../validations/review.validation');
const productController = require('../../controllers/product.controller');
const reviewController = require('../../controllers/review.controller');
const { actions, subjects } = require('../../config/roles');
const auth = require('../../middlewares/auth');
const upload = require('../../middlewares/upload'); // multer
const uploadToCloudinary = require('../../middlewares/cloudinaryUpload'); // Cloudinary upload middleware
const categoryResolver = require('../../middlewares/categoryResolver'); // Added category resolver middleware
const cors = require('cors');


const router = express.Router();
router.use(cors());
router.options('*', cors());

// Product routes
router
  .route('/')
  .post(
    auth(),
    // auth({ action: actions.create, subject: subjects.product }),
    upload.array('images', 10),
    // uploadToCloudinary(), // Upload files to Cloudinary after multer processes them
    categoryResolver, // Added middleware to resolve category names to IDs
    validate(productValidation.createProduct),
    productController.createProduct)
  .get(
    // auth({ action: actions.readAll, subject: subjects.product }),
    validate(productValidation.getProducts), productController.getProducts);

router.route('/user-products')
  .get(
    // auth({ action: actions.read, subject: subjects.product }),
    validate(productValidation.getProducts), productController.getUserProducts);

router
  .route('/:productId')
  .get(
    // auth({ action: actions.read, subject: subjects.product }),
    validate(productValidation.getProduct), productController.getProduct)
  .patch(
    // auth({ action: actions.update, subject: subjects.product }),
    validate(productValidation.updateProduct), productController.updateProduct)
  .delete(
    // auth({ action: actions.delete, subject: subjects.product }),
    validate(productValidation.deleteProduct), productController.deleteProduct);

// Review routes
router
  .route('/:productId/reviews')
  .post(
    // auth(), 
    validate(reviewValidation.createReview), reviewController.createReview)
  .get(
    validate(reviewValidation.getReviews), reviewController.getReviews);

router
  .route('/:productId/reviews/:reviewId')
  .patch(
    // auth(), 
    validate(reviewValidation.updateReview), reviewController.updateReview)
  .delete(
    // /auth(), 
    validate(reviewValidation.deleteReview), reviewController.deleteReview);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management (CRUD + listing)
 */

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a product
 *     description: Only authenticated users can create products.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - description
 *               - category
 *               - stock
 *               - size
 *               - colors
 *               - rating
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               stock:
 *                 type: integer
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               size:
 *                 type: string
 *               colors:
 *                 type: string
 *               rating:
 *                 type: number
 *               featured:
 *                 type: boolean
 *               isFavorite:
 *                 type: boolean
 *               type:
 *                 type: string
 *                 enum: [new, used]
 *     responses:
 *       "201":
 *         description: Product created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       "200":
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 totalResults:
 *                   type: integer
 */

/**
 * @swagger
 * /products/user-products:
 *   get:
 *     summary: Get logged-in user's products
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       "200":
 *         description: List of user’s products
 */

/**
 * @swagger
 * /products/{productId}:
 *   get:
 *     summary: Get a single product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       "404":
 *         description: Product not found
 *
 *   patch:
 *     summary: Update a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               stock:
 *                 type: integer
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               size:
 *                 type: string
 *               colors:
 *                 type: string
 *               rating:
 *                 type: number
 *               featured:
 *                 type: boolean
 *               isFavorite:
 *                 type: boolean
 *               type:
 *                 type: string
 *                 enum: [new, used]
 *     responses:
 *       "200":
 *         description: Product updated
 *
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "204":
 *         description: Product deleted successfully
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *         name:
 *           type: string
 *         price:
 *           type: number
 *         description:
 *           type: string
 *         category:
 *           type: string
 *         stock:
 *           type: number
 *         images:
 *           type: array
 *           items:
 *             type: string
 *         size:
 *           type: string
 *         colors:
 *           type: string
 *         rating:
 *           type: number
 *         featured:
 *           type: boolean
 *         isFavorite:
 *           type: boolean
 *         type:
 *           type: string
 *           enum: [new, used]
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 */


