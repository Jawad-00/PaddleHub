const User = require('../models/User');
const Court = require('../models/Court');

exports.listUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-passwordHash');
    res.json({ data: users });
  } catch (err) { next(err); }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body; // { active: boolean } or { role: 'OWNER' }
    const u = await User.findByIdAndUpdate(id, updates, { new: true }).select('-passwordHash');
    res.json({ data: u });
  } catch (err) { next(err); }
};

exports.listCourts = async (req, res, next) => {
  try {
    const courts = await Court.find({});
    res.json({ data: courts });
  } catch (err) { next(err); }
};

exports.deleteCourt = async (req, res, next) => {
  try {
    const c = await Court.findByIdAndRemove(req.params.id);
    res.json({ data: c });
  } catch (err) { next(err); }
};
