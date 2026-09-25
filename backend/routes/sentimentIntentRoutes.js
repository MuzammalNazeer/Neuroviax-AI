'use strict';

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getSentimentDashboard,
  analyzeLiveSentiment,
  classifyLiveIntent,
  resolveFeedbackAction,
} = require('../controllers/sentimentIntentController');

// Interactive sandbox endpoints can be used publicly or authenticated
router.post('/analyze-sentiment', analyzeLiveSentiment);
router.post('/classify-intent', classifyLiveIntent);

// Dashboard and actions require authentication or fallback to tenant context
const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.split(' ')[1]
    : null;

  if (token) {
    return protect(req, res, next);
  }
  // Allow demo fallback context if unauthenticated
  req.businessId = 'neuroviax-core';
  next();
};

router.get('/dashboard', optionalAuth, getSentimentDashboard);
router.post('/resolve-feedback', optionalAuth, resolveFeedbackAction);

module.exports = router;
