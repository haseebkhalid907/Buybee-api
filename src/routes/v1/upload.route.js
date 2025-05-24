const express = require('express');
const validate = require('../../middlewares/validate');
const uploadValidation = require('../../validations/upload.validation');
const uploadController = require('../../controllers/upload.controller');
const upload = require('../../middlewares/upload');
const auth = require('../../middlewares/auth');
const cors = require('cors');

const router = express.Router();
router.use(cors());
router.options('*', cors());

router
    .route('/')
    .post(
        // auth(), // Uncomment when ready to secure this endpoint
        upload.array('images', 10),
        uploadController.uploadImages
    );

router
    .route('/delete')
    .post(
        // auth(), // Uncomment when ready to secure this endpoint
        validate(uploadValidation.deleteImage),
        uploadController.deleteImage
    );

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Uploads
 *   description: File upload operations
 */

/**
 * @swagger
 * /uploads:
 *   post:
 *     summary: Upload multiple images
 *     description: Upload multiple images to Cloudinary
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       "200":
 *         description: Images uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 images:
 *                   type: array
 *                   items:
 *                     type: string
 */

/**
 * @swagger
 * /uploads/delete:
 *   post:
 *     summary: Delete an image from Cloudinary
 *     description: Delete an image from Cloudinary using the public ID
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               publicId:
 *                 type: string
 *                 description: Cloudinary public ID
 *     responses:
 *       "200":
 *         description: Image deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
