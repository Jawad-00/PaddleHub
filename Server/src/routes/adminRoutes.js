const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const requireRole = require('../middlewares/role');
const ctrl = require('../controllers/adminController');

router.use(auth, requireRole('ADMIN'));

router.get('/users', ctrl.listUsers);
router.put('/users/:id', ctrl.updateUser);
router.get('/courts', ctrl.listCourts);
router.delete('/courts/:id', ctrl.deleteCourt);

module.exports = router;
