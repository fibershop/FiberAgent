/**
 * GET /api/agent/[id]
 * Get agent info by ID
 */

import * as utils from '../_lib/utils.js';

export default function handler(req, res) {
  // Handle CORS
  if (utils.handleCors(req, res)) {
    res.status(200).end();
    return;
  }

  utils.setCorsHeaders(res);

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'agent_id is required' });
  }

  const agent = utils.getAgent(id);

  if (!agent) {
    return res.status(404).json({
      error: 'Agent not found',
      agent_id: id,
      message: 'This agent has not been registered yet'
    });
  }

  return res.status(200).json({
    success: true,
    agent: {
      agent_id: agent.agent_id,
      agent_name: agent.agent_name,
      wallet_address: agent.wallet_address,
      crypto_preference: agent.crypto_preference,
      registered_at: agent.registered_at,
      total_earnings: agent.total_earnings,
      api_calls_made: agent.api_calls_made,
      searches_made: agent.searches_made
    }
  });
}
