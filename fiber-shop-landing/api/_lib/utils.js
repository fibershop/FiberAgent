/**
 * Shared utilities for Vercel serverless API
 */

// In-memory mock database (resets on deployment, fine for demo)
let agents = {
  'agent_test': {
    agent_id: 'agent_test',
    agent_name: 'Test Agent',
    wallet_address: '0xtest123',
    crypto_preference: 'MON',
    registered_at: new Date().toISOString(),
    total_earnings: 0,
    api_calls_made: 0,
    searches_made: 0
  }
};

let searches = [];

// Mock products (from original api.js)
const mockProducts = {
  results: [
    {
      productId: 'prod_123',
      title: 'Blue Adidas Running Shoes',
      brand: 'Adidas',
      price: 99.99,
      priceFormatted: '$99.99',
      inStock: true,
      image: 'https://via.placeholder.com/250x150?text=Adidas+Shoes',
      shop: {
        merchantId: 456,
        name: 'Adidas Store',
        domain: 'adidas.com',
        score: 8.5
      },
      cashback: {
        rate: '5%',
        amount: 5.0,
        type: 'percentage'
      }
    },
    {
      productId: 'prod_456',
      title: 'Red Adidas Hoodie',
      brand: 'Adidas',
      price: 79.99,
      priceFormatted: '$79.99',
      inStock: true,
      image: 'https://via.placeholder.com/250x150?text=Adidas+Hoodie',
      shop: {
        merchantId: 789,
        name: 'Adidas Outlet',
        domain: 'adidasoutlet.com',
        score: 7.9
      },
      cashback: {
        rate: '3%',
        amount: 2.4,
        type: 'percentage'
      }
    },
    {
      productId: 'prod_789',
      title: 'White Adidas T-shirt',
      brand: 'Adidas',
      price: 39.99,
      priceFormatted: '$39.99',
      inStock: false,
      image: 'https://via.placeholder.com/250x150?text=Adidas+Tshirt',
      shop: {
        merchantId: 101,
        name: 'Adidas Online Store',
        domain: 'adidas.com',
        score: 9.2
      },
      cashback: {
        rate: '2%',
        amount: 0.8,
        type: 'percentage'
      }
    },
    {
      productId: 'prod_111',
      title: 'Nike Blue Rain Boots',
      brand: 'Nike',
      price: 119.99,
      priceFormatted: '$119.99',
      inStock: true,
      image: 'https://via.placeholder.com/250x150?text=Nike+Boots',
      shop: {
        merchantId: 222,
        name: 'Nike Direct',
        domain: 'nike.com',
        score: 9.1
      },
      cashback: {
        rate: '4%',
        amount: 4.8,
        type: 'percentage'
      }
    }
  ]
};

function generateToken() {
  return 'token_' + Math.random().toString(36).substr(2, 9);
}

function getAgent(agentId) {
  return agents[agentId] || null;
}

function registerAgent(agentId, agentName, walletAddress, cryptoPreference = 'MON') {
  if (agents[agentId]) {
    return {
      error: 'Agent already registered',
      error_code: 'AGENT_ALREADY_EXISTS',
      agent_id: agentId,
      registered_at: agents[agentId].registered_at,
      existing_agent_id: agentId,
      statusCode: 409
    };
  }

  const token = generateToken();
  const agent = {
    agent_id: agentId,
    agent_name: agentName || agentId,
    wallet_address: walletAddress,
    crypto_preference: cryptoPreference || 'MON',
    token: token,
    registered_at: new Date().toISOString(),
    total_earnings: 0,
    total_purchases_tracked: 0,
    api_calls_made: 0,
    searches_made: 0
  };

  agents[agentId] = agent;
  return { success: true, agent };
}

function searchProducts(query, size = 10) {
  const seenIds = new Set();
  const filteredProducts = mockProducts.results
    .filter(p =>
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.brand.toLowerCase().includes(query.toLowerCase()) ||
      p.shop.name.toLowerCase().includes(query.toLowerCase())
    )
    .filter(p => {
      if (seenIds.has(p.productId)) {
        return false;
      }
      seenIds.add(p.productId);
      return true;
    })
    .slice(0, parseInt(size));

  return filteredProducts;
}

function updateAgentStats(agentId) {
  if (agents[agentId]) {
    agents[agentId].api_calls_made++;
    agents[agentId].searches_made++;
  }
}

function recordSearch(agentId, query, resultsCount) {
  searches.push({
    agent_id: agentId,
    query,
    results_count: resultsCount,
    timestamp: new Date().toISOString()
  });
}

function getAgentStats(agentId) {
  const agent = agents[agentId];
  if (!agent) {
    return null;
  }

  const agentSearches = searches.filter(s => s.agent_id === agentId);
  
  return {
    agent_id: agentId,
    agent_name: agent.agent_name,
    total_searches: agent.searches_made,
    total_earnings: agent.total_earnings,
    api_calls_made: agent.api_calls_made,
    conversions: Math.floor(agent.searches_made * 0.1) // Mock conversion rate
  };
}

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function handleCors(req, res) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    return true;
  }
  return false;
}

export {
  agents,
  mockProducts,
  generateToken,
  getAgent,
  registerAgent,
  searchProducts,
  updateAgentStats,
  recordSearch,
  getAgentStats,
  setCorsHeaders,
  handleCors
};
