const express = require('express');
const router = express.Router();
const { getAnalyticsSummary } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

// Define the single endpoint for getting the analytics summary
router.route('/summary').get(protect, getAnalyticsSummary);

module.exports = router;
