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
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
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
};
