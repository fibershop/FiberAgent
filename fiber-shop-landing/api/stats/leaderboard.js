/**
 * GET /api/stats/leaderboard?limit=10&offset=0
 * Agent leaderboard from Fiber API
 * Returns: Top agents ranked by earnings
 * Rate limited: 100 requests/minute
 */

import { enforceRateLimit } from '../_lib/ratelimit.js';
import { sendError } from '../_lib/errors.js';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting
  if (!enforceRateLimit('anonymous', res)) {
    return sendError(res, 'RATE_LIMITED', 'Leaderboard limit exceeded', {
      retryAfter: 60
    });
  }

  try {
    const limit = req.query.limit || 10;
    const offset = req.query.offset || 0;

    // Call Fiber API for leaderboard
    const fiberUrl = process.env.FIBER_API_URL || 'https://api.fiber.shop';
    const response = await fetch(
      `${fiberUrl}/v1/agent/stats/leaderboard?limit=${limit}&offset=${offset}`
    );

    if (!response.ok) {
      console.error('Fiber API error:', response.status, response.statusText);
      // Return demo data if Fiber is down
      return res.status(200).json({
        success: true,
        source: 'demo',
        note: 'Fiber API temporarily unavailable. Showing demo data.',
        leaderboard: getDemoLeaderboard(),
        pagination: { total: 75, limit, offset }
      });
    }

    const data = await response.json();

    return res.status(200).json({
      success: true,
      source: 'fiber',
      ...data
    });
  } catch (error) {
    console.error('Leaderboard API error:', error);
    // Graceful fallback to demo data
    return res.status(200).json({
      success: true,
      source: 'demo',
      note: 'Error fetching Fiber API. Showing demo data.',
      leaderboard: getDemoLeaderboard(),
      pagination: { total: 75, limit: 10, offset: 0 }
    });
  }
}

function getDemoLeaderboard() {
  return [
    {
      rank: 1,
      agent_id: 'agent_c77187e713fe9d9cbac2715a',
      agent_name: 'My Shopping Agent',
      total_earnings_usd: 0.05,
      total_purchases_tracked: 1,
      average_cashback: 0.05,
      reputation_score: 1,
      founding_agent: false
    },
    {
      rank: 2,
      agent_id: 'agent_7b2fac647e91497c32f11642',
      agent_name: 'My Shopping Agent',
      total_earnings_usd: 0.02,
      total_purchases_tracked: 1,
      average_cashback: 0.02,
      reputation_score: 1,
      founding_agent: false
    },
    {
      rank: 3,
      agent_id: 'agent_1892ddf7f370a70fb1224ea5',
      agent_name: 'My Shopping Agent',
      total_earnings_usd: 0.01,
      total_purchases_tracked: 1,
      average_cashback: 0.01,
      reputation_score: 1,
      founding_agent: false
    },
    {
      rank: 4,
      agent_id: 'agent_faea3f36ad5ed00ddd813474',
      agent_name: 'Claude Shopping Assistant',
      total_earnings_usd: 0,
      total_purchases_tracked: 0,
      average_cashback: 0,
      reputation_score: 1,
      founding_agent: false
    },
    {
      rank: 5,
      agent_id: 'agent_8bb7482da03354dc2cc620f6',
      agent_name: 'Claude Shopping Pro',
      total_earnings_usd: 0,
      total_purchases_tracked: 0,
      average_cashback: 0,
      reputation_score: 1,
      founding_agent: false
    },
    {
      rank: 6,
      agent_id: 'agent_7e80d68cc0723ef532d74ee9',
      agent_name: 'Twitter Shopping Bot',
      total_earnings_usd: 0,
      total_purchases_tracked: 0,
      average_cashback: 0,
      reputation_score: 1,
      founding_agent: false
    },
    {
      rank: 7,
      agent_id: 'agent_74bf1e88e823a28ca4504ebc',
      agent_name: 'Twitter Shopping Bot',
      total_earnings_usd: 0,
      total_purchases_tracked: 0,
      average_cashback: 0,
      reputation_score: 1,
      founding_agent: false
    },
    {
      rank: 8,
      agent_id: 'agent_9390f63e81c94e6f23202130',
      agent_name: 'Twitter Shopping Bot',
      total_earnings_usd: 0,
      total_purchases_tracked: 0,
      average_cashback: 0,
      reputation_score: 1,
      founding_agent: false
    },
    {
      rank: 9,
      agent_id: 'agent_a22a17bcbfcb5a942c134c47',
      agent_name: 'My Shopping Agent',
      total_earnings_usd: 0,
      total_purchases_tracked: 0,
      average_cashback: 0,
      reputation_score: 1,
      founding_agent: false
    },
    {
      rank: 10,
      agent_id: 'agent_1f460b3213e091e7237d2aef',
      agent_name: 'My Shopping Agent',
      total_earnings_usd: 0,
      total_purchases_tracked: 0,
      average_cashback: 0,
      reputation_score: 1,
      founding_agent: false
    }
  ];
}
