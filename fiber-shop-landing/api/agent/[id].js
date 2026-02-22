/**
 * GET /api/agent/:id
 * Lookup agent by ID
 */

import * as utils from '../_lib/utils.js';

export default function handler(req, res) {
  if (utils.handleCors(req, res)) {
    res.status(200).end();
    return;
  }
  utils.setCorsHeaders(res);

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const agentId = req.query.id;

  if (!agentId) {
    return res.status(400).json({ error: 'agent_id is required' });
  }

  const agent = utils.getAgent(agentId);

  if (!agent) {
    return res.status(404).json({
      error: 'Agent not found',
      agent_id: agentId,
      message: 'Register first using POST /api/agent/register'
    });
  }

  // Don't expose token
  const { token, ...safeAgent } = agent;

  return res.status(200).json({
    success: true,
    agent: safeAgent
  });
}
