const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/authController');
const auth = require('../middlewares/auth');

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.post('/logout', ctrl.logout);
router.get('/me', auth, ctrl.me);

module.exports = router;
