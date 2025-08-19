const Booking = require('../models/Booking');
const Court = require('../models/Court');
const { isOverlap } = require('../utils/slotUtils');

exports.createBooking = async (req, res, next) => {
  try {
    const { courtId, startTs, durationMins = 60 } = req.body;
    const start = new Date(startTs);
    const end = new Date(start.getTime() + durationMins * 60000);

    // validate minutes alignment
    const minutes = start.getUTCMinutes();
    if (![0,30].includes(minutes)) return res.status(400).json({ error: 'Start time must be on :00 or :30' });
    if (![30,60,90,120].includes(durationMins)) return res.status(400).json({ error: 'Invalid duration' });

    // check overlaps
    const overlap = await Booking.findOne({
      courtId,
      status: 'CONFIRMED',
      $or: [
        { startTs: { $lt: end }, endTs: { $gt: start } }
      ]
    });
    if (overlap) return res.status(409).json({ error: 'Slot already booked' });

    // optional: check court exists and is active
    const court = await Court.findById(courtId);
    if (!court || !court.active) return res.status(404).json({ error: 'Court not available' });

    const booking = await Booking.create({ courtId, playerId: req.user.id, startTs: start, endTs: end, status: 'CONFIRMED' });
    res.status(201).json({ data: booking });
  } catch (err) { next(err); }
};

exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ playerId: req.user.id }).sort({ startTs: -1 });
    res.json({ data: bookings });
  } catch (err) { next(err); }
};

exports.getOwnerBookings = async (req, res, next) => {
  try {
    // list bookings for courts owned by owner
    const ownerCourts = await Court.find({ ownerId: req.user.id }).select('_id');
    const courtIds = ownerCourts.map(c => c._id);
    const bookings = await Booking.find({ courtId: { $in: courtIds } }).sort({ startTs: -1 }).populate('playerId', 'name email');
    res.json({ data: bookings });
  } catch (err) { next(err); }
};

exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Not found' });
    // only player who booked or admin should cancel (owner can also have admin override - not in MVP)
    if (!booking.playerId.equals(req.user.id) && req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    // cancellation policy: >= 2 hours before start
    const now = new Date();
    if (booking.startTs - now < 2 * 3600000 && req.user.role !== 'ADMIN') {
      return res.status(400).json({ error: 'Too late to cancel' });
    }
    booking.status = 'CANCELLED';
    await booking.save();
    res.json({ data: booking });
  } catch (err) { next(err); }
};
