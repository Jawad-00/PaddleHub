const Court = require('../models/Court');

exports.createCourt = async (req, res, next) => {
  try {
    const data = req.body;
    data.ownerId = req.user.id;
    data.city = data.city.toLowerCase();
    const c = await Court.create(data);
    res.status(201).json({ data: c });
  } catch (err) { next(err); }
};

exports.updateCourt = async (req, res, next) => {
  try {
    const c = await Court.findById(req.params.id);
    if (!c) return res.status(404).json({ error: 'Not found' });
    if (!c.ownerId.equals(req.user.id) && req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    Object.assign(c, req.body);
    await c.save();
    res.json({ data: c });
  } catch (err) { next(err); }
};

exports.deleteCourt = async (req, res, next) => {
  try {
    const c = await Court.findById(req.params.id);
    if (!c) return res.status(404).json({ error: 'Not found' });
    if (!c.ownerId.equals(req.user.id) && req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    c.active = false;
    await c.save();
    res.json({ data: c });
  } catch (err) { next(err); }
};

exports.listMyCourts = async (req, res, next) => {
  try {
    const courts = await Court.find({ ownerId: req.user.id });
    res.json({ data: courts });
  } catch (err) { next(err); }
};
