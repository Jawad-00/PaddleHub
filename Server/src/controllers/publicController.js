const Court = require('../models/Court');
const Booking = require('../models/Booking');
const { generateSlotsForDay } = require('../utils/slotUtils');

exports.searchCourts = async (req, res, next) => {
  try {
    const { city, page = 1, limit = 12, indoor } = req.query;
    const filter = { active: true };
    if (city) filter.city = new RegExp('^' + city.toLowerCase());
    if (indoor !== undefined) filter.indoor = indoor === 'true';
    const items = await Court.find(filter).skip((page-1)*limit).limit(Number(limit));
    const total = await Court.countDocuments(filter);
    res.json({ data: { items, page: Number(page), total } });
  } catch (err) { next(err); }
};

exports.getCourt = async (req, res, next) => {
  try {
    const c = await Court.findById(req.params.id);
    if (!c || !c.active) return res.status(404).json({ error: 'Not found' });
    res.json({ data: c });
  } catch (err) { next(err); }
};

exports.getAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date } = req.query; // YYYY-MM-DD
    if (!date) return res.status(400).json({ error: 'Date required' });
    const court = await Court.findById(id);
    if (!court) return res.status(404).json({ error: 'Not found' });

    // find opening hours for weekday
    const weekday = new Date(date).getDay();
    const oh = (court.openingHours || []).find(x => x.weekday === weekday);
    if (!oh) {
      return res.json({ data: [] }); // closed
    }

    const slots = generateSlotsForDay(date, oh.openTime, oh.closeTime);
    const bookings = await Booking.find({
      courtId: id,
      startTs: { $gte: new Date(`${date}T00:00:00Z`), $lt: new Date(`${date}T23:59:59Z`) },
      status: 'CONFIRMED'
    });

    const bookedSlots = [];
    bookings.forEach(b => bookedSlots.push({ start: b.startTs.toISOString(), end: b.endTs.toISOString() }));

    const response = slots.map(s => {
      const sISO = s.startTs.toISOString(), eISO = s.endTs.toISOString();
      const isBooked = bookings.some(b => (s.startTs < b.endTs && b.startTs < s.endTs));
      return { startTs: sISO, endTs: eISO, status: isBooked ? 'BOOKED' : 'AVAILABLE' };
    });

    res.json({ data: response });
  } catch (err) { next(err); }
};
