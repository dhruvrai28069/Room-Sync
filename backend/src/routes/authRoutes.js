const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/login', authController.login);
router.post('/register', authController.registerStudent);
router.get('/me', authenticateToken, authController.getMe);

module.exports = router;
