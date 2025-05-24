const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const exchangeAdValidation = require('../../validations/exchangeAd.validation');
const exchangeAdController = require('../../controllers/exchangeAd.controller');
const upload = require('../../middlewares/upload');
const cors = require('cors');

const router = express.Router();

// Apply CORS specifically to this router to ensure preflight requests are handled
router.use(cors());
router.options('*', cors());

router
    .route('/')
    .post(
        upload.array('images', 10),
        auth(),
        validate(exchangeAdValidation.createExchangeAd), exchangeAdController.createExchangeAd)
    .get(
        validate(exchangeAdValidation.getExchangeAds), exchangeAdController.getExchangeAds);

router
    .route('/search')
    .get(validate(exchangeAdValidation.searchExchangeAds), exchangeAdController.searchExchangeAds);

router
    .route('/:exchangeAdId')
    .get(validate(exchangeAdValidation.getExchangeAd), exchangeAdController.getExchangeAd)
    .patch(
        auth(),
        validate(exchangeAdValidation.updateExchangeAd), exchangeAdController.updateExchangeAd)
    .delete(
        auth(),
        validate(exchangeAdValidation.deleteExchangeAd), exchangeAdController.deleteExchangeAd);

// Add special route for current user (me) - must come before the dynamic userId route
router
    .route('/user/me')
    .get(auth(), exchangeAdController.getCurrentUserExchangeAds);

router
    .route('/user/:userId')
    .get(validate(exchangeAdValidation.getUserExchangeAds), exchangeAdController.getUserExchangeAds);

router
    .route('/:exchangeAdId/boost')
    .patch(
        auth(),
        validate(exchangeAdValidation.boostExchangeAd), exchangeAdController.boostExchangeAd);

router
    .route('/:exchangeAdId/favorite')
    .patch(validate(exchangeAdValidation.toggleFavoriteExchangeAd), exchangeAdController.toggleFavoriteExchangeAd);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Exchange Ads
 *   description: Exchange Ads management and retrieval
 */

/**
 * @swagger
 * /exchange-ads:
 *   post:
 *     summary: Create an exchange ad
 *     description: Only authenticated users can create exchange ads.
 *     tags: [Exchange Ads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - brand
 *               - price
 *               - description
 *               - category
 *               - categoryName
 *               - condition
 *               - location
 *               - images
 *             properties:
 *               name:
 *                 type: string
 *               brand:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               categoryName:
 *                 type: string
 *               condition:
 *                 type: string
 *                 enum: [new, used]
 *               location:
 *                 type: string
 *               exchangeType:
 *                 type: string
 *                 enum: [outright, swap, both]
 *               interestedInItems:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/ExchangeAd'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 * 
 *   get:
 *     summary: Get all exchange ads
 *     description: Retrieve all exchange ads with filtering options.
 *     tags: [Exchange Ads]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Ad name
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *         description: Brand name
 *       - in: query
 *         name: condition
 *         schema:
 *           type: string
 *           enum: [new, used]
 *         description: Product condition
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Product category ID
 *       - in: query
 *         name: exchangeType
 *         schema:
 *           type: string
 *           enum: [outright, swap, both]
 *         description: Exchange type preference
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: integer
 *         description: Minimum price range
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: integer
 *         description: Maximum price range
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Location
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by query in the form of field:desc/asc (ex. name:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of exchange ads
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ExchangeAd'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 totalResults:
 *                   type: integer
 *                   example: 1
 */

/**
 * @swagger
 * /exchange-ads/search:
 *   get:
 *     summary: Search exchange ads by keyword
 *     description: Search for exchange ads by keywords.
 *     tags: [Exchange Ads]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: true
 *         schema:
 *           type: string
 *         description: Keyword to search for
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by query in the form of field:desc/asc (ex. name:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of exchange ads
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ExchangeAd'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 totalResults:
 *                   type: integer
 *                   example: 1
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 */

/**
 * @swagger
 * /exchange-ads/{id}:
 *   get:
 *     summary: Get an exchange ad
 *     description: Get details of a specific exchange ad.
 *     tags: [Exchange Ads]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Exchange Ad ID
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/ExchangeAd'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update an exchange ad
 *     description: Only ad owner can update their own exchange ads.
 *     tags: [Exchange Ads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Exchange Ad ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               brand:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               categoryName:
 *                 type: string
 *               condition:
 *                 type: string
 *                 enum: [new, used]
 *               location:
 *                 type: string
 *               exchangeType:
 *                 type: string
 *                 enum: [outright, swap, both]
 *               interestedInItems:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               isActive:
 *                 type: boolean
 *               status:
 *                 type: string
 *                 enum: [active, inactive, sold, exchanged]
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/ExchangeAd'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete an exchange ad
 *     description: Only ad owner can delete their own exchange ads.
 *     tags: [Exchange Ads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Exchange Ad ID
 *     responses:
 *       "204":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */