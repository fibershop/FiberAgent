/**
 * GET /api/analytics/growth
 * Network growth metrics and historical trends
 * Returns: Agent growth, purchase growth, revenue growth over time
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
    return sendError(res, 'RATE_LIMITED', 'Growth analytics limit exceeded', {
      retryAfter: 60
    });
  }

  try {
    const days = parseInt(req.query.days) || 30;

    // Call Fiber trends endpoint
    const fiberUrl = process.env.FIBER_API_URL || 'https://api.fiber.shop';
    const response = await fetch(`${fiberUrl}/v1/agent/stats/trends?days=${days}`);

    let dailyData = [];

    if (response.ok) {
      const trendsData = await response.json();
      dailyData = trendsData.data || [];
    } else {
      dailyData = getDemoDailyData(days);
    }

    // Calculate cumulative metrics
    let cumulativeAgents = 0;
    let cumulativePurchases = 0;
    let cumulativeRevenue = 0;

    const processedData = dailyData.map((day) => {
      cumulativeAgents += day.new_agents || 0;
      cumulativePurchases += day.new_purchases || 0;
      cumulativeRevenue += day.total_earnings_usd || 0;

      return {
        date: day.date,
        new_agents: day.new_agents || 0,
        new_purchases: day.new_purchases || 0,
        daily_revenue: day.total_earnings_usd || 0,
        cumulative_agents: cumulativeAgents,
        cumulative_purchases: cumulativePurchases,
        cumulative_revenue: parseFloat(cumulativeRevenue.toFixed(2)),
        daily_avg_purchase_value: (day.new_purchases || 0) > 0 
          ? parseFloat(((day.total_earnings_usd || 0) / (day.new_purchases || 1)).toFixed(2))
          : 0
      };
    });

    return res.status(200).json({
      success: true,
      source: response.ok ? 'fiber' : 'demo',
      period: `last_${days}_days`,
      daily_data: processedData,
      summary: {
        total_agents_created: cumulativeAgents,
        total_purchases: cumulativePurchases,
        total_revenue: parseFloat(cumulativeRevenue.toFixed(2)),
        avg_agents_per_day: parseFloat((cumulativeAgents / days).toFixed(2)),
        avg_purchases_per_day: parseFloat((cumulativePurchases / days).toFixed(2)),
        avg_revenue_per_day: parseFloat((cumulativeRevenue / days).toFixed(2)),
        growth_trend: cumulativeAgents > 50 ? 'accelerating' : 'building'
      },
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Growth API error:', error);
    return res.status(200).json({
      success: true,
      source: 'demo',
      daily_data: getDemoDailyData(30)
    });
  }
}

function getDemoDailyData(days = 30) {
  const data = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    let newAgents = 0;
    let newPurchases = 0;
    let earnings = 0;

    // Realistic growth pattern
    if (i === 0) {
      newAgents = 2;
    } else if (i <= 5) {
      newAgents = Math.floor(Math.random() * 3) + 1;
    } else if (i <= 15) {
      newAgents = Math.floor(Math.random() * 8) + 2;
      if (i === 11) {
        newAgents = 8;
        newPurchases = 3;
        earnings = 0.08;
      }
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
