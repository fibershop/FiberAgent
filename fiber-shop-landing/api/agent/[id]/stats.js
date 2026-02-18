/**
 * GET /api/agent/[id]/stats
 * Get agent statistics
 */

import * as utils from '../../_lib/utils.js';

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

  const stats = utils.getAgentStats(id);

  if (!stats) {
    return res.status(404).json({
      error: 'Agent not found',
      agent_id: id,
      message: 'Register first using POST /api/agent/register'
    });
  }

  return res.status(200).json({
    success: true,
    stats
  });
}
