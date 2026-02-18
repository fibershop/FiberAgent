/**
 * POST /api/agent/register
 * Register a new AI agent
 */

import * as utils from '../_lib/utils.js';

export default function handler(req, res) {
  // Handle CORS
  if (utils.handleCors(req, res)) {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    utils.setCorsHeaders(res);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { agent_id, agent_name, wallet_address, crypto_preference } = req.body;

  // Validate required fields
  if (!agent_id || !wallet_address) {
    utils.setCorsHeaders(res);
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['agent_id', 'wallet_address']
    });
  }

  const result = utils.registerAgent(agent_id, agent_name, wallet_address, crypto_preference);

  utils.setCorsHeaders(res);

  if (result.error) {
    return res.status(result.statusCode || 409).json(result);
  }

  return res.status(200).json({
    success: true,
    message: 'Agent registered successfully',
    agent: result.agent
  });
}
