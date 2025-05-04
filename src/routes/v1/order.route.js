const express = require('express');
const validate = require('../../middlewares/validate');
const orderValidation = require('../../validations/order.validation');
const orderController = require('../../controllers/order.controller');
const { actions, subjects } = require('../../config/roles');
const auth = require('../../middlewares/auth');

const router = express.Router();

router
  .route('/')
  .post(auth({action: actions.create, subject: subjects.order}), validate(orderValidation.createOrder), orderController.createOrder)
  .get(auth({action: actions.readAll, subject: subjects.order}), validate(orderValidation.getOrders), orderController.getOrders);

router
  .route('/:orderId')
  .get(auth({action: actions.read, subject: subjects.order}), validate(orderValidation.getOrder), orderController.getOrder)
  .patch(auth({action: actions.update, subject: subjects.order}), validate(orderValidation.updateOrder), orderController.updateOrder)
  .delete(auth({action: actions.delete, subject: subjects.order}), validate(orderValidation.deleteOrder), orderController.deleteOrder);

module.exports = router;





/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management (CRUD + listing)
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - products
 *               - firstName
 *               - lastName
 *               - phone
 *               - email
 *               - totalAmount
 *               - shippingAddress
 *               - billingAddress
 *               - city
 *               - country
 *               - deliveryDate
 *               - shippingCharges
 *               - paymentMethod
 *             properties:
 *               userId:
 *                 type: string
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [productId, quantity, price]
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                       minimum: 1
 *                     price:
 *                       type: number
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: number
 *               email:
 *                 type: string
 *                 format: email
 *               totalAmount:
 *                 type: number
 *               shippingAddress:
 *                 type: string
 *               billingAddress:
 *                 type: string
 *               postalCode:
 *                 type: number
 *               city:
 *                 type: string
 *               country:
 *                 type: string
 *               deliveryDate:
 *                 type: string
 *                 format: date
 *               shippingCharges:
 *                 type: number
 *               gstApplicable:
 *                 type: boolean
 *               gst:
 *                 type: number
 *               paymentMethod:
 *                 type: string
 *                 enum: [credit_card, paypal, bank_transfer, cash]
 *               status:
 *                 type: string
 *                 enum: [pending, paid, shipped, delivered, cancelled]
 *     responses:
 *       201:
 *         description: Order created successfully
 *
 *   get:
 *     summary: Get all orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
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
 *         description: List of orders
 */

/**
 * @swagger
 * /orders/{orderId}:
 *   get:
 *     summary: Get a single order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details
 *       404:
 *         description: Order not found
 *
 *   patch:
 *     summary: Update an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
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
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: number
 *               email:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, paid, shipped, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Order updated successfully
 *
 *   delete:
 *     summary: Delete an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Order deleted successfully
 */
