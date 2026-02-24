/**
 * GET /api/agent/demo/stats
 * Demo agent statistics with realistic data
 * Used to populate analytics dashboards and statistics pages
 * Real data comes from persistent database (Session 2+)
 */

import * as utils from '../../_lib/utils.js';

export default function handler(req, res) {
  if (utils.handleCors(req, res)) {
    res.status(200).end();
    return;
  }
  utils.setCorsHeaders(res);

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Demo data showing realistic agent statistics
  const demoStats = {
    success: true,
    note: 'Demo agent statistics. Real data from persistent DB coming in Session 2.',
    agents: [
      {
        agent_id: 'claude-shopping-001',
        agent_name: 'Claude Shopping Assistant',
        wallet: '0x790b405d466f7fddcee4be90d504eb56e3fedcae',
        registered_at: '2026-02-15T08:00:00.000Z',
        total_searches: 2847,
        total_results: 56940,
        avg_results_per_search: 20,
        unique_merchants_searched: 287,
        unique_categories: 24,
        total_conversions: 142,
        conversion_rate: 5.0,
        total_revenue: 28500,
        total_commissions: 1425,
        avg_commission_rate: 5.0,
        top_searched_brands: [
          { name: 'Nike', searches: 458, conversions: 23, revenue: 3335 },
          { name: 'Adidas', searches: 287, conversions: 14, revenue: 2105 },
          { name: 'Amazon', searches: 312, conversions: 42, revenue: 6300 },
          { name: 'Best Buy', searches: 203, conversions: 18, revenue: 4500 },
          { name: 'Macy\'s', searches: 156, conversions: 12, revenue: 3600 }
        ],
        top_categories: [
          { name: 'Footwear', searches: 612, conversions: 31, revenue: 7750 },
          { name: 'Electronics', searches: 534, conversions: 42, revenue: 12600 },
          { name: 'Fashion', searches: 421, conversions: 28, revenue: 5600 },
          { name: 'Home & Garden', searches: 387, conversions: 21, revenue: 4200 },
          { name: 'Beauty & Personal Care', searches: 293, conversions: 20, revenue: 3600 }
        ],
        monthly_growth: {
          jan: { searches: 645, conversions: 32, revenue: 6400 },
          feb: { searches: 892, conversions: 56, revenue: 11200 },
          mar: { searches: 1310, conversions: 54, revenue: 10800 }
        },
        cashback_breakdown: {
          MON: 712.50,
          USDC: 356.25,
          BONK: 356.25
        }
      },
      {
        agent_id: 'gpt-shopping-pro',
        agent_name: 'GPT Shopping Pro',
        wallet: '0x123abc456def789ghi',
        registered_at: '2026-02-10T12:00:00.000Z',
        total_searches: 1523,
        total_results: 30460,
        avg_results_per_search: 20,
        unique_merchants_searched: 156,
        unique_categories: 18,
        total_conversions: 76,
        conversion_rate: 5.0,
        total_revenue: 15200,
        total_commissions: 760,
        avg_commission_rate: 5.0,
        top_searched_brands: [
          { name: 'Target', searches: 234, conversions: 12, revenue: 1800 },
          { name: 'Walmart', searches: 189, conversions: 9, revenue: 1350 },
          { name: 'Sephora', searches: 167, conversions: 13, revenue: 2600 },
          { name: 'H&M', searches: 143, conversions: 8, revenue: 1200 },
          { name: 'Uniqlo', searches: 112, conversions: 7, revenue: 1050 }
        ],
        top_categories: [
          { name: 'Apparel', searches: 423, conversions: 21, revenue: 4200 },
          { name: 'Accessories', searches: 287, conversions: 18, revenue: 3600 },
          { name: 'Cosmetics', searches: 201, conversions: 16, revenue: 3200 },
          { name: 'Home Decor', searches: 176, conversions: 11, revenue: 2200 },
          { name: 'Sports & Outdoors', searches: 156, conversions: 10, revenue: 2000 }
        ],
        monthly_growth: {
          jan: { searches: 412, conversions: 21, revenue: 4200 },
          feb: { searches: 567, conversions: 28, revenue: 5600 },
          mar: { searches: 544, conversions: 27, revenue: 5400 }
        },
        cashback_breakdown: {
          MON: 380,
          USDC: 190,
          BONK: 190
        }
      },
      {
        agent_id: 'openai-commerce-bot',
        agent_name: 'OpenAI Commerce Bot',
        wallet: '0x987zyx654wvu321tsr',
        registered_at: '2026-02-18T15:30:00.000Z',
        total_searches: 892,
        total_results: 17840,
        avg_results_per_search: 20,
        unique_merchants_searched: 98,
        unique_categories: 14,
        total_conversions: 45,
        conversion_rate: 5.0,
        total_revenue: 9000,
        total_commissions: 450,
        avg_commission_rate: 5.0,
        top_searched_brands: [
          { name: 'Apple', searches: 134, conversions: 7, revenue: 2100 },
          { name: 'Samsung', searches: 112, conversions: 6, revenue: 1800 },
          { name: 'Sony', searches: 89, conversions: 5, revenue: 1500 },
          { name: 'Microsoft', searches: 76, conversions: 4, revenue: 1200 },
          { name: 'LG', searches: 67, conversions: 4, revenue: 1200 }
        ],
        top_categories: [
          { name: 'Electronics', searches: 478, conversions: 24, revenue: 7200 },
          { name: 'Computers', searches: 234, conversions: 12, revenue: 2400 },
          { name: 'Mobile Devices', searches: 180, conversions: 9, revenue: 1800 }
        ],
        monthly_growth: {
          jan: { searches: 0, conversions: 0, revenue: 0 },
          feb: { searches: 456, conversions: 23, revenue: 4600 },
          mar: { searches: 436, conversions: 22, revenue: 4400 }
        },
        cashback_breakdown: {
          MON: 225,
          USDC: 112.50,
          BONK: 112.50
        }
      }
    ],
    network_stats: {
      total_agents: 3,
      total_searches: 5262,
      total_conversions: 263,
      total_network_revenue: 52700,
      total_commissions_paid: 2635,
      avg_commission_per_agent: 878.33,
      top_merchants: [
        { name: 'Nike', conversions: 37, revenue: 5550 },
        { name: 'Amazon', conversions: 42, revenue: 6300 },
        { name: 'Best Buy', conversions: 28, revenue: 7000 },
        { name: 'Target', conversions: 22, revenue: 3300 },
        { name: 'Walmart', conversions: 18, revenue: 2700 }
      ],
      top_categories: [
        { name: 'Electronics', conversions: 94, revenue: 14100 },
        { name: 'Footwear', conversions: 31, revenue: 7750 },
        { name: 'Fashion', conversions: 66, revenue: 13200 },
        { name: 'Home & Garden', conversions: 38, revenue: 7600 },
        { name: 'Beauty', conversions: 34, revenue: 6800 }
      ]
    }
  };

  return res.status(200).json(demoStats);
}
