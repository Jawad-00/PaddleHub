const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const genToken = (user) => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

exports.register = async (req, res, next) => {
  try {
    const { role, name, email, password } = req.body;
    if (!['OWNER','PLAYER'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ role, name, email: email.toLowerCase(), passwordHash });
    const token = genToken(user);
    res.cookie('token', token, { httpOnly: true, secure: false }); // secure=true in prod
    res.status(201).json({ data: { id: user._id, role: user.role, name: user.name, email: user.email } });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    if (!user.active) return res.status(403).json({ error: 'Account deactivated' });

    const token = genToken(user);
    res.cookie('token', token, { httpOnly: true, secure: false });
    res.json({ data: { id: user._id, role: user.role, name: user.name, email: user.email } });
  } catch (err) { next(err); }
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
