const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/my-allocation', authenticateToken, authorizeRoles('STUDENT'), studentController.getMyAllocation);
router.post('/room-change', authenticateToken, authorizeRoles('STUDENT'), studentController.requestRoomChange);
router.post('/feedback', authenticateToken, authorizeRoles('STUDENT'), studentController.submitFeedback);

module.exports = router;
