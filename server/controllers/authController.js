const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { asyncHandler, httpError } = require('../middleware/error');

function signToken(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role };
}

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    throw httpError(400, 'Name, email and password are required');
  }
  if (String(password).length < 6) {
    throw httpError(400, 'Password must be at least 6 characters');
  }
  const exists = await User.findOne({ email: String(email).toLowerCase() });
  if (exists) throw httpError(409, 'Email is already registered');

  // The role is never read from the request, so everyone registers as a normal user.
  const user = await User.create({ name, email, password });
  res.status(201).json({ token: signToken(user), user: publicUser(user) });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw httpError(400, 'Email and password are required');

  const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(String(password)))) {
    throw httpError(401, 'Invalid email or password');
  }
  res.json({ token: signToken(user), user: publicUser(user) });
});

// GET /api/auth/me
const me = (req, res) => {
  res.json({ user: publicUser(req.user) });
};

module.exports = { register, login, me };
