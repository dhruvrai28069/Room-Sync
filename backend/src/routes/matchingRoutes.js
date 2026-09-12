const express = require('express');
const router = express.Router();
const matchingController = require('../controllers/matchingController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/generate', authenticateToken, authorizeRoles('WARDEN', 'SUPER_ADMIN'), matchingController.generateAllocation);
router.post('/approve', authenticateToken, authorizeRoles('WARDEN', 'SUPER_ADMIN'), matchingController.approveAllocation);
router.post('/swap', authenticateToken, authorizeRoles('WARDEN', 'SUPER_ADMIN'), matchingController.manualSwapStudents);

module.exports = router;
