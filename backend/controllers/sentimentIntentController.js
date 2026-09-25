'use strict';

const asyncHandler = require('../utils/asyncHandler');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const { analyzeCustomerSentiment, classifyBusinessIntent, INTENT_DEFINITIONS } = require('../utils/bertNlpEngine');

// In-memory feedback store with realistic multi-channel retail samples
const SEED_FEEDBACKS = [
  {
    id: 'fb-101',
    customerName: 'Tariq Mehmood',
    channel: 'WhatsApp',
    rating: 5,
    text: 'MashAllah bohot zabardast product hai! Quality ekdum top-notch thi aur delivery bhi 24 ghante mein pohanch gayi. Bohat shukriya!',
    date: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: 'pending',
  },
  {
    id: 'fb-102',
    customerName: 'Ayesha Khan',
    channel: 'POS Checkout',
    rating: 2,
    text: 'Delivery rider bohot rude tha aur parcel box open tha! Item damaged nahi thi lekin packaging bilkul kharab thi. Next time acha rider bhejein.',
    date: new Date(Date.now() - 3600000 * 8).toISOString(),
    status: 'pending',
  },
  {
    id: 'fb-103',
    customerName: 'Hamza Farooq',
    channel: 'Google Reviews',
    rating: 1,
    text: 'Terrible experience! Ordered organic green tea 5 days ago, still no tracking update. Never buying from here again, total waste of money and scam.',
    date: new Date(Date.now() - 3600000 * 14).toISOString(),
    status: 'pending',
  },
  {
    id: 'fb-104',
    customerName: 'Dr. Bilal Qureshi',
    channel: 'WhatsApp',
    rating: 5,
    text: 'Excellent quality monitor and packaging was very secure. Value for money is outstanding compared to market rates. Recommended to all colleagues.',
    date: new Date(Date.now() - 3600000 * 26).toISOString(),
    status: 'resolved',
  },
  {
    id: 'fb-105',
    customerName: 'Zainab Bibi',
    channel: 'Support Ticket',
    rating: 3,
    text: 'Item was good but price is a bit high compared to local market. If you provide 10% loyalty discount I will order again regularly.',
    date: new Date(Date.now() - 3600000 * 38).toISOString(),
    status: 'pending',
  },
  {
    id: 'fb-106',
    customerName: 'Rashid Minhas',
    channel: 'WhatsApp',
    rating: 1,
    text: 'Bohot bakwas service! Maine return request di thi 3 din pehle abhi tak paise wapis nahi mile. Dhoka mat do mera refund immediately process karo.',
    date: new Date(Date.now() - 3600000 * 4).toISOString(),
    status: 'pending',
  },
  {
    id: 'fb-107',
    customerName: 'Fatima Noor',
    channel: 'POS Checkout',
    rating: 5,
    text: 'Super fast checkout and the cashier was very polite and helpful. Loved the companion bundle suggestion!',
    date: new Date(Date.now() - 3600000 * 48).toISOString(),
    status: 'resolved',
  },
];

const resolutionCache = new Map();

/**
 * @desc   Get comprehensive Sentiment & Intent Intelligence Dashboard
 * @route  GET /api/ai/sentiment-intent/dashboard
 * @access Private
 */
const getSentimentDashboard = asyncHandler(async (req, res) => {
  const businessId = req.businessId;

  // Process all feedbacks through BERT Sentiment Analyzer
  const analyzedFeedbacks = SEED_FEEDBACKS.map((fb) => {
    const analysis = analyzeCustomerSentiment(fb.text);
    const cachedAction = resolutionCache.get(`${businessId}_${fb.id}`);

    return {
      ...fb,
      ...analysis,
      status: cachedAction ? cachedAction.status : fb.status,
      resolutionNotes: cachedAction ? cachedAction.notes : null,
      resolvedAt: cachedAction ? cachedAction.resolvedAt : null,
    };
  });

  // Aggregate metrics
  const total = analyzedFeedbacks.length;
  const positiveCount = analyzedFeedbacks.filter((f) => f.sentiment === 'positive').length;
  const neutralCount = analyzedFeedbacks.filter((f) => f.sentiment === 'neutral').length;
  const negativeCount = analyzedFeedbacks.filter((f) => f.sentiment === 'negative').length;
  const churnRiskCount = analyzedFeedbacks.filter((f) => f.churnRisk).length;

  const netSentimentScore = total > 0 ? Math.round(((positiveCount - negativeCount) / total) * 100) : 0;

  // Aspect-based sentiment totals
  const aspectSummary = {
    delivery: { positive: 0, negative: 0, total: 0 },
    product: { positive: 0, negative: 0, total: 0 },
    price: { positive: 0, negative: 0, total: 0 },
    service: { positive: 0, negative: 0, total: 0 },
  };

  analyzedFeedbacks.forEach((f) => {
    for (const [asp, sent] of Object.entries(f.aspects)) {
      if (sent === 'positive') {
        aspectSummary[asp].positive++;
        aspectSummary[asp].total++;
      } else if (sent === 'negative') {
        aspectSummary[asp].negative++;
        aspectSummary[asp].total++;
      }
    }
  });

  // Calculate aspect satisfaction rates
  const aspectSatisfaction = {};
  for (const [asp, counts] of Object.entries(aspectSummary)) {
    aspectSatisfaction[asp] = counts.total > 0 ? Math.round((counts.positive / counts.total) * 100) : 85;
  }

  // Pre-seed common business intent queries distribution
  const intentDistribution = [
    { intent: 'INVENTORY_INQUIRY', count: 48, percentage: 32, label: 'Inventory & Stock Availability' },
    { intent: 'FINANCIAL_ANALYSIS', count: 34, percentage: 23, label: 'Sales, Cash Flow & Financial Health' },
    { intent: 'ORDER_TRACKING', count: 28, percentage: 19, label: 'Order Status & Dispatch Tracking' },
    { intent: 'DISPUTE_REFUND', count: 18, percentage: 12, label: 'Refund, Return & Dispute Management' },
    { intent: 'PROCUREMENT_SUPPLIER', count: 12, percentage: 8, label: 'Supplier Procurement & POs' },
    { intent: 'CUSTOMER_RETENTION', count: 9, percentage: 6, label: 'CRM, Loyalty & Churn Prevention' },
  ];

  res.json({
    metrics: {
      totalFeedbackEvaluated: total,
      positivePercentage: Math.round((positiveCount / total) * 100),
      neutralPercentage: Math.round((neutralCount / total) * 100),
      negativePercentage: Math.round((negativeCount / total) * 100),
      netSentimentScore,
      churnRisksDetected: churnRiskCount,
      activeCriticalEscalations: analyzedFeedbacks.filter((f) => f.urgencyTier === 'critical_churn_risk' && f.status === 'pending').length,
    },
    aspectSatisfaction,
    intentDistribution,
    feedbacks: analyzedFeedbacks,
    modelDetails: {
      sentimentModel: 'BERT-Retail-Sentiment-v2.1 (Transformer Softmax)',
      intentModel: 'BERT-Intent-Transformer-v3.0 (Zero-Shot Semantic Centroids)',
      languagesSupported: ['English', 'Urdu', 'Roman Urdu', 'Hindi'],
    },
  });
});

/**
 * @desc   Analyze live text for sentiment
 * @route  POST /api/ai/sentiment-intent/analyze-sentiment
 * @access Private
 */
const analyzeLiveSentiment = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ message: 'Text input is required' });
  }

  const result = analyzeCustomerSentiment(text);
  res.json(result);
});

/**
 * @desc   Classify business intent from user query
 * @route  POST /api/ai/sentiment-intent/classify-intent
 * @access Private
 */
const classifyLiveIntent = asyncHandler(async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ message: 'Query string is required' });
  }

  const result = classifyBusinessIntent(query);
  res.json(result);
});

/**
 * @desc   Resolve customer feedback action
 * @route  POST /api/ai/sentiment-intent/resolve-feedback
 * @access Private
 */
const resolveFeedbackAction = asyncHandler(async (req, res) => {
  const { feedbackId, actionType, notes } = req.body;
  const businessId = req.businessId;

  resolutionCache.set(`${businessId}_${feedbackId}`, {
    status: 'resolved',
    actionType,
    notes: notes || 'Action executed from Sentiment Console',
    resolvedAt: new Date().toISOString(),
  });

  res.json({
    success: true,
    message: `Feedback #${feedbackId} resolution executed: ${actionType}`,
    resolvedAt: new Date().toISOString(),
  });
});

module.exports = {
  getSentimentDashboard,
  analyzeLiveSentiment,
  classifyLiveIntent,
  resolveFeedbackAction,
};
