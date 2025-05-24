const httpStatus = require('http-status');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const { authService, userService, tokenService, emailService } = require('../services');
const { roleRights } = require('../config/roles');
const config = require('../config/config');


const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  // res.status(httpStatus.CREATED).send({ user, tokens });
  res
    .cookie('tokens', JSON.stringify({ tokens, user }), {
      domain: process.env.BASE_PATH,
      // secure: true,
      // httpOnly: true,
      // sameSite: 'none',
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: config.jwt.refreshExpirationDays * 24 * 60 * 60 * 1000,
      expires: tokens.access.expires,
    })
    .status(httpStatus.CREATED)
    .send({ user, tokens });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  // res.send({ user, tokens, roleRights: roleRights.get(user.role) });
  res
    .cookie('tokens', JSON.stringify({ tokens, user }), {
      domain: process.env.BASE_PATH,
      // secure: true,
      // httpOnly: true,
      // sameSite: 'none',
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: config.jwt.refreshExpirationDays * 24 * 60 * 60 * 1000,
      expires: tokens.access.expires,
    })
    .send({ user, tokens, roleRights: roleRights.get(user.role) });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);

  // Get user information for the cookie
  const payload = jwt.verify(tokens.access.token, config.jwt.secret);
  const user = await userService.getUserById(payload.sub);

  // Send both the response and update the cookie for consistent authentication
  res
    .cookie('tokens', JSON.stringify({ tokens, user }), {
      domain: process.env.BASE_PATH,
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: config.jwt.refreshExpirationDays * 24 * 60 * 60 * 1000,
      expires: tokens.access.expires,
    })
    .send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.query.token, req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
  await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.query.token);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
};
