const express = require('express');
const router = express.Router();
const { phoneLogin } = require('../controllers/authController');

router.post('/login', phoneLogin);

module.exports = router;