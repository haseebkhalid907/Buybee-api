const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService, productService } = require('../services');

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  // Handle the special 'me' parameter by replacing it with the authenticated user's ID
  const userId = req.params.userId === 'me' ? req.user._id : req.params.userId;
  const user = await userService.getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  // Handle the special 'me' parameter by replacing it with the authenticated user's ID
  const userId = req.params.userId === 'me' ? req.user._id : req.params.userId;
  const user = await userService.updateUserById(userId, req.body);
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

// Wishlist operations
const getWishlist = catchAsync(async (req, res) => {
  const userId = req.params.userId || req.user.id;

  const user = await userService.getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Check if the user has any items in wishlist
  if (!user.wishlist || user.wishlist.length === 0) {
    return res.send([]);
  }

  // Get full product details for all wishlist items
  const populatedWishlist = await Promise.all(
    user.wishlist.map(async (productId) => {
      try {
        const product = await productService.getProductById(productId);
        return product;
      } catch (err) {
        console.error(`Error fetching product ${productId}:`, err);
        return null;
      }
    })
  );

  // Filter out null results
  const validProducts = populatedWishlist.filter(product => product !== null);
  res.send(validProducts);
});

const addToWishlist = catchAsync(async (req, res) => {
  const { productId } = req.body;
  console.log("🚀 ~ addToWishlist ~ productId:", productId)
  const userId = req.params.userId || req.user.id;

  if (!productId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Product ID is required');
  }

  // Check if the product exists
  const product = await productService.getProductById(productId);
  console.log("🚀 ~ addToWishlist ~ product:", product)
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }

  const user = await userService.getUserById(userId);
  console.log("🚀 ~ addToWishlist ~ user:", user)
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  user.addToWishlist(productId);
  await user.save();

  res.status(httpStatus.OK).send({ message: 'Product added to wishlist successfully' });
});

const removeFromWishlist = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const userId = req.params.userId || req.user.id;

  const user = await userService.getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  user.removeFromWishlist(productId);
  await user.save();

  res.status(httpStatus.OK).send({ message: 'Product removed from wishlist successfully' });
});

// Cart operations
const getCart = catchAsync(async (req, res) => {
  const userId = req.params.userId || req.user._id;
  console.log("🚀 ~ getCart ~ userId:", userId)
  const user = await userService.getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Populate product details in the cart
  await user.populate('cart.product');
  res.send(user.cart);
});

const addToCart = catchAsync(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const userId = req.params.userId || req.user._id;
  const uu = req.user;
  console.log("🚀 ~ addToCart ~ uu:", uu)
  const uu2 = req.auth;
  console.log("🚀 ~ addToCart ~ uu2:", uu2)
  console.log("🚀 ~ addToCart ~ userId:", userId)

  if (!productId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Product ID is required');
  }

  // Check if the product exists
  const product = await productService.getProductById(productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }

  // Check if the product has enough stock
  if (product.stock < quantity) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Not enough stock available');
  }

  const user = await userService.getUserById(userId);
  console.log("🚀 ~ addToCart ~ user:", user)
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  user.addToCart(productId, Number(quantity), userId);
  await user.save();

  res.status(httpStatus.OK).send({ message: 'Product added to cart successfully' });
});

const updateCartItem = catchAsync(async (req, res) => {
  const { productId } = req.params; // This is actually the cart item ID
  const { quantity } = req.body;
  const userId = req.params.userId || req.user.id;

  if (!quantity || quantity < 1) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Valid quantity is required');
  }

  // Get the user
  const user = await userService.getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Find the cart item by its ID
  const cartItem = user.cart.id(productId);
  if (!cartItem) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cart item not found');
  }

  // Get the product to check stock
  const product = await productService.getProductById(cartItem.product);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }

  // Check if the product has enough stock
  if (product.stock < quantity) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Not enough stock available');
  }

  // Update the quantity directly on the subdocument
  cartItem.quantity = Number(quantity);
  cartItem.addedAt = Date.now();

  await user.save();

  res.status(httpStatus.OK).send({ message: 'Cart updated successfully' });
});

const removeFromCart = catchAsync(async (req, res) => {
  const { productId } = req.params; // This is actually the cart item ID
  const userId = req.params.userId || req.user.id;

  const user = await userService.getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Find the cart item by its ID
  const cartItem = user.cart.id(productId);
  if (!cartItem) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cart item not found');
  }

  // Remove the item from the cart array using Mongoose subdocument remove method
  cartItem.remove();
  await user.save();

  res.status(httpStatus.OK).send({ message: 'Product removed from cart successfully' });
});

const clearCart = catchAsync(async (req, res) => {
  const userId = req.params.userId || req.user.id;

  const user = await userService.getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  user.clearCart();
  await user.save();

  res.status(httpStatus.OK).send({ message: 'Cart cleared successfully' });
});

// Seller Registration Step Management
const updateSellerRegistrationStep = catchAsync(async (req, res) => {
  // Handle the special 'me' parameter by replacing it with the authenticated user's ID
  const userId = req.params.userId === 'me' ? req.user._id : req.params.userId;
  const { step, completed } = req.body;

  if (!step || typeof completed !== 'boolean') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Step name and completion status are required');
  }

  // Validate step name
  const validSteps = ['termsAccepted', 'storeInfoCompleted', 'personalInfoCompleted', 'bankInfoCompleted'];
  if (!validSteps.includes(step)) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Invalid step name. Must be one of: ${validSteps.join(', ')}`);
  }

  const user = await userService.getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Initialize sellerProfile and registrationSteps if they don't exist
  if (!user.sellerProfile) {
    user.sellerProfile = {};
  }
  if (!user.sellerProfile.registrationSteps) {
    user.sellerProfile.registrationSteps = {};
  }

  // Update the specific step
  user.sellerProfile.registrationSteps[step] = completed;

  // Check if all steps are completed
  const allStepsCompleted = validSteps.every(stepName =>
    user.sellerProfile.registrationSteps[stepName] === true
  );

  // Update the overall registration completion status
  user.sellerProfile.registrationCompleted = allStepsCompleted;

  await user.save();
  res.status(httpStatus.OK).send({
    message: `Seller registration step '${step}' updated successfully`,
    registrationCompleted: user.sellerProfile.registrationCompleted,
    registrationSteps: user.sellerProfile.registrationSteps
  });
});

const getSellerRegistrationStatus = catchAsync(async (req, res) => {
  // Handle the special 'me' parameter by replacing it with the authenticated user's ID
  const userId = req.params.userId === 'me' ? req.user._id : req.params.userId;

  const user = await userService.getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Return registration status or defaults if not set
  const registrationStatus = {
    registrationCompleted: user.sellerProfile?.registrationCompleted || false,
    registrationSteps: user.sellerProfile?.registrationSteps || {
      termsAccepted: false,
      storeInfoCompleted: false,
      personalInfoCompleted: false,
      bankInfoCompleted: false
    }
  };

  res.status(httpStatus.OK).send(registrationStatus);
});

// Current user profile handlers
const getCurrentUser = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const user = await userService.getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const updateCurrentUser = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const user = await userService.updateUserById(userId, req.body);
  res.send(user);
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  updateSellerRegistrationStep,
  getSellerRegistrationStatus,
  getCurrentUser,
  updateCurrentUser,
};
