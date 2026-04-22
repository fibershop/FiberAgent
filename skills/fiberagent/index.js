/**
 * FiberAgent Skill for OpenClaw
 * Find products with cryptocurrency cashback across 50,000+ merchants
 * 
 * Powered by Wildfire affiliate network on Monad blockchain (ERC-8004)
 */

const API_BASE = 'https://fiberagent.shop/api';
const DEFAULT_SIZE = 10;
const REQUEST_TIMEOUT = 10000;

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Validate wallet address (basic Ethereum format)
 */
function isValidWallet(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate agent ID (alphanumeric + dash/underscore)
 */
function isValidAgentId(id) {
  return /^[a-zA-Z0-9_-]{3,32}$/.test(id);
}

/**
 * Format cashback for display
 */
function formatCashback(cashback) {
  if (!cashback) return 'No cashback';
  return `${cashback.rate || '0%'} (${cashback.currency || 'MON'} ${cashback.amount || 0})`;
}

/**
 * Tool: Search products with cashback
 */
const search_products = {
  description: 'Search for products with cashback rates across 50,000+ merchants. Returns best deals ranked by effective price (price - cashback).',
  params: {
    keywords: {
      type: 'string',
      description: 'Product name or description (e.g., "dyson airwrap", "gaming laptop under 1500")'
    },
    agent_id: {
      type: 'string',
      description: 'Your agent ID for tracking conversions and earning crypto (wallet address 0x... or agent name)'
    },
    limit: {
      type: 'number',
      description: 'Number of results to return (default 10, max 50)'
    }
  },
  fn: async ({ keywords, agent_id, limit = DEFAULT_SIZE }) => {
    // Validation
    if (!keywords || typeof keywords !== 'string' || keywords.trim().length === 0) {
      return {
        error: 'INVALID_QUERY',
        message: 'keywords must be a non-empty string'
      };
    }

    if (!agent_id || typeof agent_id !== 'string' || agent_id.trim().length === 0) {
      return {
        error: 'INVALID_AGENT_ID',
        message: 'agent_id required (wallet address 0x... or agent name)'
      };
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
      return {
        error: 'INVALID_LIMIT',
        message: 'limit must be integer between 1 and 50'
      };
    }

    try {
      const url = `${API_BASE}/agent/search?keywords=${encodeURIComponent(keywords)}&agent_id=${encodeURIComponent(agent_id)}&size=${limit}`;
      const data = await fetchWithTimeout(url);

      if (data.error) {
        return {
          error: data.error,
          message: data.message || 'API error'
        };
      }

      // Format response
      return {
        query: keywords,
        count: data.results?.length || 0,
        products: (data.results || []).map(p => ({
          title: p.title,
          price: `$${p.price}`,
          shop: p.shop?.name || 'Unknown',
          cashback: formatCashback(p.cashback),
          effectivePrice: `$${(p.price - (p.cashback?.amount || 0)).toFixed(2)}`,
          affiliateUrl: p.affiliateUrl,
          rating: p.rating || 'N/A'
        })),
        summary: `Found ${data.results?.length || 0} products. Best deal: ${data.results?.[0]?.title || 'N/A'}`
      };
    } catch (err) {
      return {
        error: 'SEARCH_FAILED',
        message: err.message || 'Failed to search products'
      };
    }
  }
};

/**
 * Tool: Compare cashback across products
 */
const compare_cashback = {
  description: 'Compare cashback rates for the same product across different merchants. Helps find the best deal.',
  params: {
    product: {
      type: 'string',
      description: 'Product name to compare (e.g., "iPhone 15 Pro")'
    },
    agent_id: {
      type: 'string',
      description: 'Your agent ID for tracking'
    }
  },
  fn: async ({ product, agent_id }) => {
    if (!product || typeof product !== 'string' || product.trim().length === 0) {
      return {
        error: 'INVALID_PRODUCT',
        message: 'product must be a non-empty string'
      };
    }

    if (!agent_id || typeof agent_id !== 'string') {
      return {
        error: 'INVALID_AGENT_ID',
        message: 'agent_id required'
      };
    }

    try {
      const url = `${API_BASE}/agent/search?keywords=${encodeURIComponent(product)}&agent_id=${encodeURIComponent(agent_id)}&size=20`;
      const data = await fetchWithTimeout(url);

      if (data.error) {
        return { error: data.error, message: data.message };
      }

      // Group by shop and sort by effective price
      const byShop = {};
      (data.results || []).forEach(p => {
        const shop = p.shop?.name || 'Unknown';
        if (!byShop[shop]) {
          byShop[shop] = [];
        }
        byShop[shop].push(p);
      });

      const comparison = Object.entries(byShop).map(([shop, products]) => {
        const best = products.reduce((a, b) => 
          (a.price - (a.cashback?.amount || 0)) < (b.price - (b.cashback?.amount || 0)) ? a : b
        );
        return {
          shop,
          price: `$${best.price}`,
          cashback: formatCashback(best.cashback),
          effectivePrice: `$${(best.price - (best.cashback?.amount || 0)).toFixed(2)}`,
          affiliateUrl: best.affiliateUrl
        };
      }).sort((a, b) => 
        parseFloat(a.effectivePrice) - parseFloat(b.effectivePrice)
      );

      return {
        product,
        merchants: comparison.length,
        bestDeal: comparison[0],
        allDeals: comparison,
        savings: comparison.length > 1 ? 
          `Save $${(parseFloat(comparison[comparison.length - 1].effectivePrice) - parseFloat(comparison[0].effectivePrice)).toFixed(2)} by choosing ${comparison[0].shop}` 
          : 'Only one merchant found'
      };
    } catch (err) {
      return {
        error: 'COMPARE_FAILED',
        message: err.message || 'Failed to compare cashback'
      };
    }
  }
};

/**
 * Tool: Register agent with wallet
 */
const register_agent = {
  description: 'Register your agent with FiberAgent to start earning crypto cashback on purchases. One-time setup.',
  params: {
    agent_id: {
      type: 'string',
      description: 'Unique name for your agent (3-32 chars, alphanumeric + dash/underscore)'
    },
    wallet_address: {
      type: 'string',
      description: 'Your Monad wallet address (0x...)'
    },
    preferred_token: {
      type: 'string',
      description: 'Preferred cashback token: MON (default), BONK, or USDC'
    }
  },
  fn: async ({ agent_id, wallet_address, preferred_token = 'MON' }) => {
    // Validation
    if (!agent_id || !isValidAgentId(agent_id)) {
      return {
        error: 'INVALID_AGENT_ID',
        message: 'agent_id must be 3-32 chars (alphanumeric, dash, underscore)'
      };
    }

    if (!wallet_address || !isValidWallet(wallet_address)) {
      return {
        error: 'INVALID_WALLET',
        message: 'wallet_address must be valid Ethereum format (0x...)'
      };
    }

    if (!['MON', 'BONK', 'USDC'].includes(preferred_token)) {
      return {
        error: 'INVALID_TOKEN',
        message: 'preferred_token must be MON, BONK, or USDC'
      };
    }

    try {
      const url = `${API_BASE}/agent/register`;
      const data = await fetchWithTimeout(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_id: agent_id.toLowerCase(),
          wallet_address: wallet_address.toLowerCase(),
          preferred_token: preferred_token
        })
      });

      if (data.error) {
        return { error: data.error, message: data.message };
      }

      return {
        success: true,
        agent_id: data.agent_id,
        wallet: data.wallet_address,
        status: 'Ready to earn crypto cashback',
        token: data.preferred_token,
        profile_url: `https://fiberagent.shop/agents/${data.agent_id}`,
        erc8004_score: data.erc8004_score || 0
      };
    } catch (err) {
      return {
        error: 'REGISTRATION_FAILED',
        message: err.message || 'Failed to register agent'
      };
    }
  }
};

/**
 * Tool: Get agent stats (earnings, conversions, reputation)
 */
const get_agent_stats = {
  description: 'Get your agent earnings, conversion stats, and ERC-8004 reputation score on Monad blockchain.',
  params: {
    agent_id: {
      type: 'string',
      description: 'Your agent ID or wallet address'
    }
  },
  fn: async ({ agent_id }) => {
    if (!agent_id || typeof agent_id !== 'string') {
      return {
        error: 'INVALID_AGENT_ID',
        message: 'agent_id required'
      };
    }

    try {
      const url = `${API_BASE}/agent/${encodeURIComponent(agent_id)}/stats`;
      const data = await fetchWithTimeout(url);

      if (data.error) {
        return { error: data.error, message: data.message };
      }

      return {
        agent_id: data.agent_id,
        wallet: data.wallet_address,
        stats: {
          totalEarnings: `${data.total_earnings || 0} ${data.preferred_token || 'MON'}`,
          conversions: data.conversions || 0,
          clicks: data.clicks || 0,
          conversionRate: `${((data.conversions / (data.clicks || 1)) * 100).toFixed(2)}%`,
          avgOrderValue: `$${(data.avg_order_value || 0).toFixed(2)}`
        },
        reputation: {
          erc8004Score: data.erc8004_score || 0,
          trustLevel: data.trust_level || 'Pending',
          foundingAgent: data.is_founding_agent || false
        },
        lastActivity: data.last_activity || 'Never',
        profileUrl: `https://fiberagent.shop/agents/${data.agent_id}`
      };
    } catch (err) {
      return {
        error: 'STATS_FETCH_FAILED',
        message: err.message || 'Failed to fetch agent stats'
      };
    }
  }
};

/**
 * Skill export for OpenClaw
 */
module.exports = {
  name: 'fiberagent',
  version: '2.0.0',
  description: 'Find products with crypto cashback across 50,000+ merchants on Monad blockchain',
  author: 'Laurent Salou',
  license: 'MIT',
  homepage: 'https://fiberagent.shop',
  
  tools: {
    search_products,
    compare_cashback,
    register_agent,
    get_agent_stats
  }
};
