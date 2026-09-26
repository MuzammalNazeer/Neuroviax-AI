const asyncHandler = require('../utils/asyncHandler');
const {
  runGeminiTripartiteReasoning,
  fetchTripartiteData,
  isConfiguredApiKey,
} = require('../utils/geminiReasoningEngine');

/**
 * @desc  Fetch Gemini Tripartite Data & Strategic Reasoning Insights
 * @route GET /api/ai/gemini-reasoning/overview
 */
const getTripartiteOverview = asyncHandler(async (req, res) => {
  const businessId = req.businessId;

  const result = await runGeminiTripartiteReasoning({
    businessId,
  });

  res.status(200).json({
    success: true,
    ...result,
  });
});

/**
 * @desc  Query Gemini Reasoning Engine with custom scenario or prompt
 * @route POST /api/ai/gemini-reasoning/ask
 */
const askGeminiReasoning = asyncHandler(async (req, res) => {
  const { question, scenario } = req.body;
  const businessId = req.businessId;

  const scenarioPrompt = question || scenario || 'Assess overall financial resilience and inventory risk.';

  const result = await runGeminiTripartiteReasoning({
    businessId,
    scenarioPrompt,
  });

  res.status(200).json({
    success: true,
    query: scenarioPrompt,
    ...result,
  });
});

/**
 * @desc  Get Gemini configuration status & model metadata
 * @route GET /api/ai/gemini-reasoning/status
 */
const getGeminiStatus = asyncHandler(async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY || '';
  const model = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
  const hasValidKey = isConfiguredApiKey(apiKey);

  res.status(200).json({
    success: true,
    configured: hasValidKey,
    model,
    keyStatus: hasValidKey ? 'Valid API Key Provided' : 'Placeholder (Neural Simulation Mode)',
    maskedKey: hasValidKey ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : 'your_api_key_here',
    architecture: {
      provider: 'Google Gemini',
      package: '@google/genai',
      version: 'v2.24.0',
      tripartiteDomains: [
        { name: 'Inventory', database: 'MongoDB', collections: ['inventories', 'products', 'suppliers'] },
        { name: 'Sales', database: 'MongoDB', collections: ['orders', 'customers'] },
        { name: 'Finance', database: 'MongoDB', collections: ['payments', 'expenses', 'subscriptions'] },
      ],
      output: 'Cross-Domain Strategic AI Reasoning & Prescriptive Action Plan',
    },
  });
});

module.exports = {
  getTripartiteOverview,
  askGeminiReasoning,
  getGeminiStatus,
};
