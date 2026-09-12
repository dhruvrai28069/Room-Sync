const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/config', authenticateToken, authorizeRoles('SUPER_ADMIN'), adminController.getSystemConfig);
router.put('/config', authenticateToken, authorizeRoles('SUPER_ADMIN'), adminController.updateSystemConfig);
router.get('/analytics', authenticateToken, authorizeRoles('WARDEN', 'SUPER_ADMIN'), adminController.getAnalyticsSummary);
router.get('/requests', authenticateToken, authorizeRoles('WARDEN', 'SUPER_ADMIN'), adminController.getRoomChangeRequests);
router.patch('/requests/:id', authenticateToken, authorizeRoles('WARDEN', 'SUPER_ADMIN'), adminController.updateRoomChangeRequestStatus);
router.get('/export-csv', authenticateToken, authorizeRoles('WARDEN', 'SUPER_ADMIN'), adminController.exportAllocationCSV);

module.exports = router;
