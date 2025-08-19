const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const requireRole = require('../middlewares/role');
const ctrl = require('../controllers/courtController');

router.post('/', auth, requireRole('OWNER'), ctrl.createCourt);
router.get('/', auth, requireRole('OWNER'), ctrl.listMyCourts);
router.put('/:id', auth, requireRole('OWNER'), ctrl.updateCourt);
router.delete('/:id', auth, requireRole('OWNER'), ctrl.deleteCourt);

module.exports = router;
