/**
 * Roles configuration for the application
 * USER_ROLES: The available user roles
 * roleRights: The permissions/rights associated with each role
 */

const actions = {
  read: 'read',
  readAll: 'readAll',
  create: 'create',
  manage: 'manage',
  update: 'update',
  delete: 'delete',
};
const subjects = {
  profile: 'profile',
  user: 'user',
  product: 'product',
  order: 'order',
  all: 'all',
};
const USER_ROLES = {
  ADMIN: 'admin',
  BUYER: 'buyer',
  SELLER: 'seller',
};

const allRoles = {
  [USER_ROLES.BUYER]: ['getProducts', 'getCategories', 'createOrder', 'manageOwnOrders', 'manageOwnProfile'],
  [USER_ROLES.SELLER]: ['getProducts', 'getCategories', 'manageOwnProducts', 'manageSellerOrders', 'manageOwnProfile'],
  [USER_ROLES.ADMIN]: ['getUsers', 'manageUsers', 'getProducts', 'manageProducts', 'getCategories', 'manageCategories', 'manageOrders', 'getStats'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  actions,
  subjects,
  roles,
  roleRights,
  USER_ROLES,
};
