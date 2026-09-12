const express = require('express');
const router = express.Router();
const hostelController = require('../controllers/hostelController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, hostelController.getAllHostels);
router.get('/:id', authenticateToken, hostelController.getHostelDetails);
router.post('/rooms', authenticateToken, authorizeRoles('WARDEN', 'SUPER_ADMIN'), hostelController.createRoom);
router.patch('/rooms/:id/lock', authenticateToken, authorizeRoles('WARDEN', 'SUPER_ADMIN'), hostelController.updateRoomLock);

module.exports = router;
