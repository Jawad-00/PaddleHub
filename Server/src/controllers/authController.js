const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const genToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

// ===================== REGISTER =====================
exports.register = async (req, res, next) => {
  try {
    const { role, name, email, password } = req.body;

    // Allow only OWNER and PLAYER signup
    if (!['OWNER', 'PLAYER'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check duplicate email
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    // Hash password & create user
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      role,
      name,
      email: email.toLowerCase(),
      passwordHash,
    });

    // Generate JWT
    const token = genToken(user);

    // Send response with token
    res.status(201).json({
      message: 'User registered successfully',
      data: {
        id: user._id,
        role: user.role,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
};

// ===================== LOGIN =====================
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    // Compare password
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    if (user.active === false) {
      return res.status(403).json({ error: 'Account deactivated' });
    }

    // Generate JWT
    const token = genToken(user);

    // Send response with token
    res.json({
      message: 'Login successful',
      data: {
        id: user._id,
        role: user.role,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
};


exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
};

exports.me = async (req, res, next) => {
  try {
    const UserModel = require('../models/User');
    const u = await UserModel.findById(req.user.id).select('-passwordHash');
    res.json({ data: u });
  } catch (err) { next(err); }
};
