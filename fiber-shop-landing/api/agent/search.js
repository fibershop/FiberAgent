/**
 * GET/POST /api/agent/search
 * Search products by keywords
 * 
 * Rate limited: 100 req/min per agent
 * Calls the REAL Fiber API first, falls back to mock data if unavailable
 */

import * as utils from '../_lib/utils.js';
import { enforceRateLimit } from '../_lib/ratelimit.js';
import { sendError, handleFiberApiError } from '../_lib/errors.js';

const FIBER_API = 'https://api.fiber.shop/v1';

async function searchFiberAPI(keywords, agentId, size = 10) {
  try {
    const params = new URLSearchParams({
      keywords,
      agent_id: agentId,
      limit: String(size)
    });

    const response = await fetch(`${FIBER_API}/agent/search?${params}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(8000) // 8s timeout
    });

    if (!response.ok) {
      console.error(`Fiber API returned ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    // Normalize Fiber API v1 response (production format)
    if (data.results && Array.isArray(data.results)) {
      return data.results.map((p, i) => ({
        productId: p.id || p.product_id || `fiber_${i}`,
        title: p.title || p.name || 'Unknown Product',
        brand: p.brand || extractBrand(p.merchant_name || ''),
        price: p.price || 0,
        priceFormatted: p.price ? `$${p.price.toFixed(2)}` : '$0.00',
        inStock: p.in_stock !== false,
        image: p.image_url || p.image || p.thumbnail || null,
        url: p.url || p.product_url || null,
        affiliateUrl: p.affiliate_link || p.affiliate_url || null,
        shop: {
          merchantId: p.merchant_id || 0,
          name: p.merchant_name || p.merchant || 'Unknown',
          domain: p.merchant_domain || p.domain || '',
          score: p.merchant_score || null
        },
        cashback: {
          rate: p.cashback?.display || (p.cashback_rate ? `${p.cashback_rate}%` : (p.commission_rate ? `${p.commission_rate}%` : '0%')),
          amount: p.cashback?.amount_usd || p.cashback_amount || (p.price && p.cashback_rate ? +(p.price * p.cashback_rate / 100).toFixed(2) : 0),
          type: 'percentage'
        }
      }));
    }

    // Legacy fallback for older API format
    if (data.products && Array.isArray(data.products)) {
      return data.products;
    }

    return null;
  } catch (err) {
    console.error('Fiber API search error:', err.message);
    return null;
  }
}

function extractBrand(merchantName) {
  const known = ['Nike', 'Adidas', 'Puma', 'Reebok', 'New Balance', 'Under Armour', 'Finish Line', 'Foot Locker'];
  for (const b of known) {
    if (merchantName.toLowerCase().includes(b.toLowerCase())) return b;
  }
  return merchantName;
}

export default async function handler(req, res) {
  if (utils.handleCors(req, res)) {
    res.status(200).end();
    return;
  }
  utils.setCorsHeaders(res);

  let keywords, agent_id, size = 10;

  if (req.method === 'GET') {
    keywords = req.query.keywords;
    agent_id = req.query.agent_id;
    size = parseInt(req.query.size) || 10;
  } else if (req.method === 'POST') {
    keywords = req.body.query || req.body.keywords;
    agent_id = req.body.agent_id;
    size = parseInt(req.body.size) || 10;
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!keywords || !agent_id) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['keywords/query', 'agent_id']
    });
  }

  // Rate limiting check (per agent_id)
  if (!enforceRateLimit(agent_id, res)) {
    return sendError(res, 'RATE_LIMITED', 'You have exceeded the request limit', {
      retryAfter: 60
    });
  }

  // Validate Bearer token (optional for backward compatibility)
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
  }

  try {
    utils.updateAgentStats(agent_id);

    // Try real Fiber API first
    let products = await searchFiberAPI(keywords, agent_id, size);
    let source = 'fiber_live';

    // Fall back to mock data
    if (!products || products.length === 0) {
      products = utils.searchProducts(keywords, size);
      source = products.length > 0 ? 'mock_catalog' : 'no_results';
    }

    // Deduplicate by productId
    const seen = new Set();
    products = products.filter(p => {
      const id = p.productId || p.id;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    utils.recordSearch(agent_id, keywords, products.length);

    return res.status(200).json({
      success: true,
      query: keywords,
      agent_id,
      total_results: products.length,
      results: products,
      source,
      timestamp: new Date().toISOString(),
      note: 'Each product includes cashback amount. Agent earns this when a purchase is tracked.'
    });
  } catch (err) {
    console.error('Search error:', err);
    return res.status(500).json({ error: err.message });
  }
}
