/**
 * POST /api/agent/register
 * Register a new AI agent
 * Rate limited: 10 registrations per hour per IP
 */

import * as utils from '../_lib/utils.js';
import { enforceRateLimit } from '../_lib/ratelimit.js';
import { sendError } from '../_lib/errors.js';

export default function handler(req, res) {
  // Handle CORS
  if (utils.handleCors(req, res)) {
    res.status(200).end();
    return;
  }

  utils.setCorsHeaders(res);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { agent_id, agent_name, wallet_address, crypto_preference } = req.body;

  // Validate required fields
  if (!agent_id || !wallet_address) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['agent_id', 'wallet_address']
    });
  }

  // Rate limiting (by agent_id)
  if (!enforceRateLimit(agent_id, res)) {
    return sendError(res, 'RATE_LIMITED', 'Registration limit exceeded', {
      retryAfter: 3600
    });
  }

  const result = utils.registerAgent(agent_id, agent_name, wallet_address, crypto_preference);

  utils.setCorsHeaders(res);

  if (result.error) {
    return res.status(result.statusCode || 409).json(result);
  }

  // Generate Bearer token for the new agent
  const auth_token = utils.generateAuthToken(agent_id);

  return res.status(200).json({
    success: true,
    message: 'Agent registered successfully',
    agent: result.agent,
    auth_token: auth_token,
    token_type: 'Bearer',
    created_at: new Date().toISOString(),
    note: 'Use auth_token in Authorization header for subsequent API calls: "Authorization: Bearer <token>"'
  });
}
