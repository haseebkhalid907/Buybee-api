const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const sellerValidation = require('../../validations/seller.validation');
const sellerController = require('../../controllers/seller.controller');
const { actions, subjects } = require('../../config/roles');

const router = express.Router();

router
  .route('/')
  .post(auth({action: actions.create, subject: subjects.user}), validate(sellerValidation.createSeller), sellerController.createSelller)
  .get(auth({action: actions.readAll, subject: subjects.user}), validate(sellerValidation.getSellers), sellerController.getSellers);

router
  .route('/:sellerId')
  .get(auth({action: actions.read, subject: subjects.user}), validate(sellerValidation.getSeller), sellerController.getSeller)
  .patch(auth({action: actions.update, subject: subjects.user}), validate(sellerValidation.updateSeller), sellerController.updateSeller)
  .delete(auth({action: actions.delete, subject: subjects.user}), validate(sellerValidation.deleteSeller), sellerController.deleteSelelr);

module.exports = router;










/**
 * @swagger
 * tags:
 *   name: Sellers
 *   description: Seller management and onboarding
 */

/**
 * @swagger
 * /sellers:
 *   post:
 *     summary: Register a new seller
 *     tags: [Sellers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - storeName
 *               - categary
 *               - description
 *               - email
 *               - phone
 *               - cnicFront
 *               - cnicBack
 *               - checkbook
 *               - paymentShedule
 *               - passCode
 *             properties:
 *               userId:
 *                 type: string
 *               storeName:
 *                 type: string
 *               categary:
 *                 type: array
 *                 items:
 *                   type: string
 *               city:
 *                 type: string
 *               area:
 *                 type: string
 *               streetNo:
 *                 type: string
 *               shopNo:
 *                 type: string
 *               description:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               cnicFront:
 *                 type: string
 *               cnicBack:
 *                 type: string
 *               bankName:
 *                 type: string
 *               accountOrIban:
 *                 type: string
 *               checkbook:
 *                 type: string
 *               paymentShedule:
 *                 type: string
 *               passCode:
 *                 type: string
 *     responses:
 *       201:
 *         description: Seller created successfully
 *
 *   get:
 *     summary: Get all sellers
 *     tags: [Sellers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: shopName
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
 *       200:
 *         description: List of sellers
 */

/**
 * @swagger
 * /sellers/{sellerId}:
 *   get:
 *     summary: Get a single seller by ID
 *     tags: [Sellers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Seller details
 *       404:
 *         description: Seller not found
 *
 *   patch:
 *     summary: Update seller details
 *     tags: [Sellers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sellerId
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
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Seller updated
 *
 *   delete:
 *     summary: Delete a seller
 *     tags: [Sellers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Seller deleted successfully
 */