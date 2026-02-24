/**
 * GET /api/stats/platform
 * Platform-wide statistics from Fiber API
 * Returns: total agents, searches, purchases, cashback, leaderboard data
 * Rate limited: 100 requests/minute (anonymous)
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

  // Rate limiting (use 'anonymous' for unauthenticated requests)
  if (!enforceRateLimit('anonymous', res)) {
    return sendError(res, 'RATE_LIMITED', 'Platform stats limit exceeded', {
      retryAfter: 60
    });
  }

  try {
    // Call Fiber API for platform stats
    const fiberUrl = process.env.FIBER_API_URL || 'https://api.fiber.shop';
    const response = await fetch(`${fiberUrl}/v1/agent/stats/platform`);

    if (!response.ok) {
      console.error('Fiber API error:', response.status, response.statusText);
      // Return demo data if Fiber is down
      return res.status(200).json({
        success: true,
        source: 'demo',
        note: 'Fiber API temporarily unavailable. Showing demo data.',
        stats: getDemoData()
      });
    }

    const data = await response.json();

    return res.status(200).json({
      success: true,
      source: 'fiber',
      ...data
    });
  } catch (error) {
    console.error('Stats API error:', error);
    // Graceful fallback to demo data
    return res.status(200).json({
      success: true,
      source: 'demo',
      note: 'Error fetching Fiber API. Showing demo data.',
      stats: getDemoData()
    });
  }
}

function getDemoData() {
  return {
    total_agents_registered: 75,
    active_agents: 75,
    active_searching_agents: 4,
    active_searching_agents_today: 3,
    total_searches: 5,
    total_products_suggested: 34,
    total_purchases_made: 3,
    total_purchase_value_usd: 715,
    total_cashback_sent_usd: 0.08,
    total_purchases_tracked: 3,
    total_pending_payout_usd: 0,
    total_purchases_paid: 3,
    searches_today: 4,
    searches_this_week: 5,
    avg_products_per_search: 6.8,
    avg_searches_per_registered_agent: 0.07,
    avg_cashback_per_purchase: 0.03,
    total_merchants: 7295,
    dashboard: {
      kpis: {
        total_volume: {
          value_usd: 715,
          change_pct_vs_last_week: 0,
          series: [0, 0, 0, 715, 0, 0]
        },
        total_searches: {
          value: 5,
          change_pct_vs_last_week: 100,
          series: [0, 0, 0, 0, 0, 5]
        },
        active_agents: {
          value: 75,
          new_agents_this_week: 6,
          change_pct_vs_last_week: -82.9,
          series: [0, 0, 0, 0, 0, 4]
        },
        cashback_sent: {
          value_usd: 0.08,
          purchases_paid: 3
        }
      },
      cashback_token_ranking: [
        {
          rank: 1,
          symbol: 'BONK',
          name: 'Bonk',
          network: 'Solana',
          selected_by: 749
        },
        {
          rank: 2,
          symbol: 'MON',
          name: 'Monad',
          network: 'Monad',
          selected_by: 53
        },
        {
          rank: 3,
          symbol: 'SOL',
          name: 'Solana',
          network: 'Solana',
          selected_by: 4
        }
      ],
      top_performing_brands: [
        {
          merchant: 'Mayert - Stiedemann',
          sales_count: 1,
          purchase_value_usd: 297
        },
        {
          merchant: 'Kozey - Streich',
          sales_count: 1,
          purchase_value_usd: 228
        },
        {
          merchant: 'Towne - Hickle',
          sales_count: 1,
          purchase_value_usd: 190
        }
      ],
      trending_verticals: [
        {
          vertical: 'Toys & Games',
          sales_count: 1,
          purchase_value_usd: 297
        },
        {
          vertical: 'Clothing & Apparel',
          sales_count: 1,
          purchase_value_usd: 228
        },
        {
          vertical: 'Health & Beauty',
          sales_count: 1,
          purchase_value_usd: 190
        }
      ],
      metadata: {
        dashboard_window_days: 30,
        generated_at: new Date().toISOString()
      }
    },
    timestamp: new Date().toISOString()
  };
}
