const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/publicController');

router.get('/courts', ctrl.searchCourts);
router.get('/courts/:id', ctrl.getCourt);
router.get('/courts/:id/availability', ctrl.getAvailability);

module.exports = router;
