const { User } = require('../models');
const { generateToken } = require('../utils/jwt');
const { successResponse, errorResponse } = require('../utils/response');

const register = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return errorResponse(res, 'Email address already in use', 409);
    }

    const user = await User.create({ fullName, email, password });
    const token = generateToken(user.id);

    return successResponse(res, { user, token }, 'Registration successful', 201);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    const token = generateToken(user.id);
    return successResponse(res, { user, token }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res) => {
  // JWT is stateless; client must discard the token.
  return successResponse(res, null, 'Logged out successfully');
};

const getMe = async (req, res) => {
  return successResponse(res, { user: req.user }, 'User retrieved');
};

module.exports = { register, login, logout, getMe };
