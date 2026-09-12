const express = require('express');
const router = express.Router();
const questionnaireController = require('../controllers/questionnaireController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/active', authenticateToken, questionnaireController.getActiveQuestionnaire);
router.post('/submit', authenticateToken, authorizeRoles('STUDENT'), questionnaireController.submitQuestionnaire);
router.get('/my-response', authenticateToken, authorizeRoles('STUDENT'), questionnaireController.getMyResponse);

module.exports = router;
