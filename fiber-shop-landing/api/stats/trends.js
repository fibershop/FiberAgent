/**
 * GET /api/stats/trends?days=30
 * Historical trends from Fiber API
 * Returns: Daily data for new agents, purchases, earnings
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
    return sendError(res, 'RATE_LIMITED', 'Trends limit exceeded', {
      retryAfter: 60
    });
  }

  try {
    const days = req.query.days || 30;

    // Call Fiber API for trends
    const fiberUrl = process.env.FIBER_API_URL || 'https://api.fiber.shop';
    const response = await fetch(`${fiberUrl}/v1/agent/stats/trends?days=${days}`);

    if (!response.ok) {
      console.error('Fiber API error:', response.status, response.statusText);
      // Return demo data if Fiber is down
      return res.status(200).json({
        success: true,
        source: 'demo',
        note: 'Fiber API temporarily unavailable. Showing demo data.',
        period: 'daily',
        days,
        data: getDemoTrends(days)
      });
    }

    const data = await response.json();

    return res.status(200).json({
      success: true,
      source: 'fiber',
      ...data
    });
  } catch (error) {
    console.error('Trends API error:', error);
    // Graceful fallback to demo data
    return res.status(200).json({
      success: true,
      source: 'demo',
      note: 'Error fetching Fiber API. Showing demo data.',
      period: 'daily',
      days: 30,
      data: getDemoTrends(30)
    });
  }
}

function getDemoTrends(days = 30) {
  const data = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    // Generate realistic trending data
    let newAgents = 0;
    let newPurchases = 0;
    let earnings = 0;

    // More activity in recent days
    if (i === 0) {
      newAgents = 2;
      newPurchases = 0;
      earnings = 0;
    } else if (i <= 3) {
      newAgents = Math.floor(Math.random() * 3) + 1;
      newPurchases = 0;
      earnings = 0;
    } else if (i === 11) {
      // Feb 13: Big day
      newAgents = 8;
      newPurchases = 3;
      earnings = 0.08;
    } else if (i <= 15) {
      newAgents = Math.floor(Math.random() * 6) + 2;
      newPurchases = 0;
      earnings = 0;
    } else {
      newAgents = 0;
      newPurchases = 0;
      earnings = 0;
    }

    data.push({
      date: dateStr,
      new_agents: newAgents,
      new_purchases: newPurchases,
      total_earnings_usd: parseFloat(earnings.toFixed(2))
    });
  }

  return data;
}
