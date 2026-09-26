'use strict';

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getTripartiteOverview,
  askGeminiReasoning,
  getGeminiStatus,
} = require('../controllers/geminiReasoningController');

// Optional authentication helper: resolves real tenant if JWT provided, otherwise falls back to demo tenant
const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.split(' ')[1]
    : null;

  if (token) {
    return protect(req, res, next);
  }
  req.businessId = 'neuroviax-core';
  next();
};

// Gemini status & model metadata
router.get('/status', getGeminiStatus);

// Gemini Tripartite cross-domain synthesis
router.get('/overview', optionalAuth, getTripartiteOverview);

// Ad-hoc question / scenario reasoning
router.post('/ask', optionalAuth, askGeminiReasoning);

module.exports = router;
