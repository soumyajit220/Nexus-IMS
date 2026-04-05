const express = require('express');
const router = express.Router();
const { getDashboardStats, getAgentPerformance, getAgentAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, getDashboardStats);
router.get('/agents', protect, getAgentPerformance);
router.get('/agent-analytics', protect, getAgentAnalytics);

module.exports = router;
