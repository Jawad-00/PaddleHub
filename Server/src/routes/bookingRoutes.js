const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const requireRole = require('../middlewares/role');
const ctrl = require('../controllers/bookingController');

router.post('/', auth, requireRole('PLAYER'), ctrl.createBooking);
router.get('/player', auth, requireRole('PLAYER'), ctrl.getMyBookings);
router.get('/owner', auth, requireRole('OWNER'), ctrl.getOwnerBookings);
router.delete('/:id', auth, ctrl.cancelBooking); // role checked inside controller

module.exports = router;
