/**
 * GET/POST /api/agent/search
 * Search products by keywords
 */

import * as utils from '../_lib/utils.js';

export default function handler(req, res) {
  // Handle CORS
  if (utils.handleCors(req, res)) {
    res.status(200).end();
    return;
  }

  utils.setCorsHeaders(res);

  let keywords, agent_id, size = 10;

  // Handle both GET and POST
  if (req.method === 'GET') {
    keywords = req.query.keywords;
    agent_id = req.query.agent_id;
    size = req.query.size || 10;
  } else if (req.method === 'POST') {
    keywords = req.body.query;
    agent_id = req.body.agent_id;
    size = req.body.size || 10;
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate required fields
  if (!keywords || !agent_id) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['keywords/query', 'agent_id']
    });
  }

  try {
    // Update agent stats
    utils.updateAgentStats(agent_id);

    // Search products
    const filteredProducts = utils.searchProducts(keywords, size);

    // Record search
    utils.recordSearch(agent_id, keywords, filteredProducts.length);

    return res.status(200).json({
      success: true,
      query: keywords,
      agent_id,
      total_results: filteredProducts.length,
      results: filteredProducts,
      timestamp: new Date().toISOString(),
      note: 'Each product includes cashback amount. Agent will receive this amount in crypto when purchase is tracked.'
    });
  } catch (err) {
    console.error('Search error:', err);
    return res.status(500).json({ error: err.message });
  }
}
