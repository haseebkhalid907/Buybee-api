const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { sellerService } = require('../services');

const createSelller = catchAsync(async (req, res) => {
  const user = await sellerService.createSeller({...req.body, userId: req?.user?.id ? req.user.id : req?.user?._id});
  res.status(httpStatus.CREATED).send(user);
});

const getSellers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['shopName']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await sellerService.querySellers(filter, options);
  res.send(result);
});

const getSeller = catchAsync(async (req, res) => {
  const user = await sellerService.getSellerById(req.params.sellerId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Seller not found');
  }
  res.send(user);
});

const updateSeller = catchAsync(async (req, res) => {
  const user = await sellerService.updateSellerById(req.params.sellerId, req.body);
  res.send(user);
});

const deleteSelelr = catchAsync(async (req, res) => {
  await sellerService.deleteSelelerById(req.params.sellerId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createSelller,
  getSellers,
  getSeller,
  updateSeller,
  deleteSelelr,
};
