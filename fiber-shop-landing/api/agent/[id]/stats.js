/**
 * GET /api/agent/:id/stats
 * Get agent performance statistics
 * Rate limited: 100 requests/minute per agent
 */

import * as utils from '../../_lib/utils.js';
import { enforceRateLimit } from '../../_lib/ratelimit.js';
import { sendError } from '../../_lib/errors.js';

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

  // Rate limiting check (per agent_id)
  if (!enforceRateLimit(agentId, res)) {
    return sendError(res, 'RATE_LIMITED', 'You have exceeded the stats request limit', {
      retryAfter: 60
    });
  }

  // Validate Bearer token (optional for backward compatibility)
  // Will be REQUIRED in Session 2 after all clients are updated
  const auth_token = utils.getAuthToken(req);
  if (auth_token) {
    const validated_agent_id = utils.validateAuthToken(auth_token);
    if (!validated_agent_id) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired Bearer token',
        required: 'Authorization: Bearer <token>'
      });
    }
    // Verify that the token's agent_id matches the requested agent
    if (validated_agent_id !== agentId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Token is for a different agent',
        requested_agent: agentId,
        token_agent: validated_agent_id
      });
    }
  }

  let stats = utils.getAgentStats(agentId);

  // In serverless, each function has isolated memory — return reasonable defaults
  if (!stats) {
    stats = {
      agent_id: agentId,
      agent_name: agentId,
      total_searches: 0,
      total_earnings: 0,
      api_calls_made: 0,
      conversions: 0
    };
  }

  return res.status(200).json({
    success: true,
    stats: {
      ...stats,
      total_earnings_mon: stats.total_earnings || 0,
      total_purchases_tracked: 0,
      fiber_points: Math.floor((stats.total_searches || 0) * 10),
      registered_at: utils.getAgent(agentId)?.registered_at || new Date().toISOString(),
      note: 'Stats reset on cold start (serverless). Persistent stats coming with database integration in Session 2.'
    }
  });
}
