const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    const token = req.cookies && req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Auth required' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);
    if (!user || !user.active) return res.status(403).json({ error: 'Forbidden' });

    req.user = { id: user._id, role: user.role, name: user.name };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
