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

// Product catalog — real product data with actual images and affiliate info
const mockProducts = {
  results: [
    // === NIKE ===
    {
      productId: 'nike_pegasus_41',
      title: 'Nike Pegasus 41 — Men\'s Road Running Shoes',
      brand: 'Nike',
      price: 145.00,
      priceFormatted: '$145.00',
      inStock: true,
      image: 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/770bb236-05c7-4fad-a23c-cac2734a8284/AIR+ZOOM+PEGASUS+41.png',
      url: 'https://www.nike.com/w/pegasus-shoes-8nexhzy7ok',
      affiliateUrl: '',
      shop: { merchantId: 3922888, name: 'NIKE', domain: 'nike.com', score: 9.4 },
      cashback: { rate: '0.65%', amount: 0.94, type: 'percentage' }
    },
    {
      productId: 'nike_vomero_premium',
      title: 'Nike Vomero Premium — Men\'s Road Running Shoes',
      brand: 'Nike',
      price: 230.00,
      priceFormatted: '$230.00',
      inStock: true,
      image: 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/33d6f8d4-a863-437b-ab3d-c6307831cdd9/NIKE+VOMERO+PREMIUM.png',
      url: 'https://www.nike.com/w/zoom-vomero-shoes-7gee1zy7ok',
      affiliateUrl: '',
      shop: { merchantId: 3922888, name: 'NIKE', domain: 'nike.com', score: 9.4 },
      cashback: { rate: '0.65%', amount: 1.50, type: 'percentage' }
    },
    {
      productId: 'nike_vomero5_fl',
      title: 'Women\'s Nike Zoom Vomero 5 — Casual Shoes',
      brand: 'Nike',
      price: 170.00,
      priceFormatted: '$170.00',
      inStock: true,
      image: 'https://media.finishline.com/i/finishline/HF1877_001_P1?bg=rgb(237,237,237)&fmt=auto&w=400&h=400',
      url: 'https://www.finishline.com/pdp/womens-nike-zoom-vomero-5-casual-shoes/prod2866808/HF1877/001',
      affiliateUrl: '',
      shop: { merchantId: 5517209, name: 'Finish Line', domain: 'finishline.com', score: 8.7 },
      cashback: { rate: '3.25%', amount: 5.53, type: 'percentage' }
    },
    {
      productId: 'nike_airmax270',
      title: 'Nike Air Max 270',
      brand: 'Nike',
      price: 170.00,
      priceFormatted: '$170.00',
      inStock: true,
      image: 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/6ae6bf27-085b-4d8d-b370-fd96b7ad3d33/AIR+MAX+270.png',
      url: 'https://www.nike.com/w/air-max-270-shoes-5ix6dzy7ok',
      affiliateUrl: '',
      shop: { merchantId: 3922888, name: 'NIKE', domain: 'nike.com', score: 9.4 },
      cashback: { rate: '0.65%', amount: 1.11, type: 'percentage' }
    },
    {
      productId: 'nike_af1_fl',
      title: 'Men\'s Nike Air Force 1 \'07 LV8 — Casual Shoes',
      brand: 'Nike',
      price: 115.00,
      priceFormatted: '$115.00',
      inStock: true,
      image: 'https://media.finishline.com/i/finishline/CW6999_600_P1?bg=rgb(237,237,237)&fmt=auto&w=400&h=400',
      url: 'https://www.finishline.com/pdp/mens-nike-air-force-1-07-lv8-casual-shoes/prod2785305/CW6999/600',
      affiliateUrl: '',
      shop: { merchantId: 5517209, name: 'Finish Line', domain: 'finishline.com', score: 8.7 },
      cashback: { rate: '3.25%', amount: 3.74, type: 'percentage' }
    },
    // === ADIDAS ===
    {
      productId: 'adidas_ultraboost',
      title: 'Adidas Ultraboost 5 Running Shoes',
      brand: 'Adidas',
      price: 190.00,
      priceFormatted: '$190.00',
      inStock: true,
      image: 'https://assets.adidas.com/images/w_400,f_auto,q_auto/68ae7ea7849b43eca70aaf1601151571_9366/Ultraboost_5_Running_Shoes_Black_ID8816_01_standard.jpg',
      url: 'https://www.adidas.com/us/ultraboost-5-running-shoes/ID8816.html',
      affiliateUrl: '',
      shop: { merchantId: 4211003, name: 'Adidas', domain: 'adidas.com', score: 9.0 },
      cashback: { rate: '3.5%', amount: 6.65, type: 'percentage' }
    },
    {
      productId: 'adidas_samba',
      title: 'Adidas Samba OG Shoes',
      brand: 'Adidas',
      price: 110.00,
      priceFormatted: '$110.00',
      inStock: true,
      image: 'https://assets.adidas.com/images/w_400,f_auto,q_auto/36ee3e89895c4a0489c6af1601157781_9366/Samba_OG_Shoes_White_B75806_01_standard.jpg',
      url: 'https://www.adidas.com/us/samba-og-shoes/B75806.html',
      affiliateUrl: '',
      shop: { merchantId: 4211003, name: 'Adidas', domain: 'adidas.com', score: 9.0 },
      cashback: { rate: '3.5%', amount: 3.85, type: 'percentage' }
    },
    {
      productId: 'adidas_gazelle',
      title: 'Adidas Gazelle Indoor Shoes',
      brand: 'Adidas',
      price: 120.00,
      priceFormatted: '$120.00',
      inStock: true,
      image: 'https://assets.adidas.com/images/w_400,f_auto,q_auto/904cdbc97a8240db97b3af9200bcf67b_9366/Gazelle_Indoor_Shoes_Green_IG1596_01_standard.jpg',
      url: 'https://www.adidas.com/us/gazelle-indoor-shoes/IG1596.html',
      affiliateUrl: '',
      shop: { merchantId: 4211003, name: 'Adidas', domain: 'adidas.com', score: 9.0 },
      cashback: { rate: '3.5%', amount: 4.20, type: 'percentage' }
    },
    // === SUPPLEMENTS ===
    {
      productId: 'on_creatine',
      title: 'Optimum Nutrition Micronized Creatine Monohydrate Powder — 120 Servings',
      brand: 'Optimum Nutrition',
      price: 32.99,
      priceFormatted: '$32.99',
      inStock: true,
      image: 'https://m.media-amazon.com/images/I/61e2s-cF+xL._AC_SX400_.jpg',
      url: 'https://www.amazon.com/dp/B002DYIZEO',
      affiliateUrl: '',
      shop: { merchantId: 1234567, name: 'Amazon', domain: 'amazon.com', score: 9.5 },
      cashback: { rate: '1%', amount: 0.33, type: 'percentage' }
    },
    {
      productId: 'bodybuilding_creatine',
      title: 'MuscleTech Cell-Tech Creatine Monohydrate — 6lbs',
      brand: 'MuscleTech',
      price: 49.97,
      priceFormatted: '$49.97',
      inStock: true,
      image: 'https://www.bodybuilding.com/images/store/400/400/143651.jpg',
      url: 'https://www.bodybuilding.com/store/muscletech/cell-tech.html',
      affiliateUrl: '',
      shop: { merchantId: 2345678, name: 'Bodybuilding.com', domain: 'bodybuilding.com', score: 8.8 },
      cashback: { rate: '5%', amount: 2.50, type: 'percentage' }
    },
    {
      productId: 'gnc_creatine',
      title: 'GNC Pro Performance Creatine Monohydrate — Unflavored 300g',
      brand: 'GNC',
      price: 19.99,
      priceFormatted: '$19.99',
      inStock: true,
      image: 'https://www.gnc.com/dw/image/v2/BBLB_PRD/on/demandware.static/-/Sites-masterCatalog_GNC/default/dw_400x400/images/hi-res/350163_web.jpg',
      url: 'https://www.gnc.com/creatine/350163.html',
      affiliateUrl: '',
      shop: { merchantId: 3456789, name: 'GNC', domain: 'gnc.com', score: 8.3 },
      cashback: { rate: '4%', amount: 0.80, type: 'percentage' }
    },
    // === ELECTRONICS ===
    {
      productId: 'sony_wh1000xm5',
      title: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
      brand: 'Sony',
      price: 348.00,
      priceFormatted: '$348.00',
      inStock: true,
      image: 'https://m.media-amazon.com/images/I/51aXvjzcukL._AC_SX400_.jpg',
      url: 'https://www.amazon.com/dp/B0BX2L8PZG',
      affiliateUrl: '',
      shop: { merchantId: 1234567, name: 'Amazon', domain: 'amazon.com', score: 9.5 },
      cashback: { rate: '1%', amount: 3.48, type: 'percentage' }
    },
    {
      productId: 'airpods_pro2',
      title: 'Apple AirPods Pro 2 with USB-C',
      brand: 'Apple',
      price: 249.00,
      priceFormatted: '$249.00',
      inStock: true,
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MQD83?wid=400&fmt=jpeg',
      url: 'https://www.bestbuy.com/site/apple-airpods-pro-2/6447382.p',
      affiliateUrl: '',
      shop: { merchantId: 4567890, name: 'Best Buy', domain: 'bestbuy.com', score: 9.2 },
      cashback: { rate: '1.5%', amount: 3.74, type: 'percentage' }
    },
    // === DYSON ===
    {
      productId: 'dyson_airwrap',
      title: 'Dyson Airwrap i.d. Multi-Styler — Smart Personalized Styling',
      brand: 'Dyson',
      price: 549.99,
      priceFormatted: '$549.99',
      inStock: true,
      image: 'https://dyson-h.assetsadobe2.com/is/image/content/dam/dyson/images/products/primary/448867-01.png?$responsive$&cropPathE=desktop&fit=stretch,1&wid=400',
      url: 'https://www.dyson.com/hair-care/hair-stylers/airwrap/multi-styler-complete-long',
      affiliateUrl: '',
      shop: { merchantId: 7890123, name: 'Dyson', domain: 'dyson.com', score: 9.6 },
      cashback: { rate: '10%', amount: 55.00, type: 'percentage' }
    },
    {
      productId: 'dyson_supersonic',
      title: 'Dyson Supersonic Hair Dryer — Nickel/Copper',
      brand: 'Dyson',
      price: 429.99,
      priceFormatted: '$429.99',
      inStock: true,
      image: 'https://dyson-h.assetsadobe2.com/is/image/content/dam/dyson/images/products/primary/389922-01.png?$responsive$&cropPathE=desktop&fit=stretch,1&wid=400',
      url: 'https://www.dyson.com/hair-care/hair-dryers/supersonic/nickel-copper',
      affiliateUrl: '',
      shop: { merchantId: 7890123, name: 'Dyson', domain: 'dyson.com', score: 9.6 },
      cashback: { rate: '10%', amount: 43.00, type: 'percentage' }
    },
    {
      productId: 'dyson_v15',
      title: 'Dyson V15 Detect Absolute Cordless Vacuum',
      brand: 'Dyson',
      price: 749.99,
      priceFormatted: '$749.99',
      inStock: true,
      image: 'https://dyson-h.assetsadobe2.com/is/image/content/dam/dyson/images/products/primary/394472-01.png?$responsive$&cropPathE=desktop&fit=stretch,1&wid=400',
      url: 'https://www.dyson.com/vacuum-cleaners/cordless/v15/detect-absolute',
      affiliateUrl: '',
      shop: { merchantId: 7890123, name: 'Dyson', domain: 'dyson.com', score: 9.6 },
      cashback: { rate: '10%', amount: 75.00, type: 'percentage' }
    },
    {
      productId: 'dyson_airwrap_sephora',
      title: 'Dyson Airwrap Multi-Styler Complete Long',
      brand: 'Dyson',
      price: 549.99,
      priceFormatted: '$549.99',
      inStock: true,
      image: 'https://www.sephora.com/productimages/sku/s2693490-main-zoom.jpg',
      url: 'https://www.sephora.com/product/dyson-airwrap-multi-styler-complete-long-P504771',
      affiliateUrl: '',
      shop: { merchantId: 8901234, name: 'Sephora', domain: 'sephora.com', score: 9.3 },
      cashback: { rate: '5%', amount: 27.50, type: 'percentage' }
    },
    // === APPAREL ===
    {
      productId: 'north_face_puffer',
      title: 'The North Face Nuptse 1996 Retro Puffer Jacket',
      brand: 'The North Face',
      price: 330.00,
      priceFormatted: '$330.00',
      inStock: true,
      image: 'https://images.thenorthface.com/is/image/TheNorthFace/NF0A3C8D_JK3_hero?wid=400&fmt=jpeg',
      url: 'https://www.thenorthface.com/en-us/jackets-and-vests/mens-jackets-and-vests-c211793/1996-retro-nuptse-jacket-pNF0A3C8D',
      affiliateUrl: '',
      shop: { merchantId: 5678901, name: 'The North Face', domain: 'thenorthface.com', score: 9.1 },
      cashback: { rate: '2.5%', amount: 8.25, type: 'percentage' }
    },
    {
      productId: 'lululemon_abc',
      title: 'lululemon ABC Classic-Fit Pants — Warpstreme',
      brand: 'lululemon',
      price: 138.00,
      priceFormatted: '$138.00',
      inStock: true,
      image: 'https://images.lululemon.com/is/image/lululemon/LM5AQDS_0001_1?wid=400&fmt=jpeg',
      url: 'https://shop.lululemon.com/p/men-pants/Abc-Classic-Fit-Pant/_/prod8980473',
      affiliateUrl: '',
      shop: { merchantId: 6789012, name: 'lululemon', domain: 'lululemon.com', score: 9.3 },
      cashback: { rate: '3%', amount: 4.14, type: 'percentage' }
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
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 0);

  // Score products: more matching words = higher score
  const scored = mockProducts.results.map(p => {
    const searchable = `${p.title} ${p.brand} ${p.shop.name}`.toLowerCase();
    
    // Check full query match first (highest priority)
    if (searchable.includes(queryLower)) {
      return { product: p, score: 100 };
    }

    // Count individual word matches
    const matchCount = queryWords.filter(w => searchable.includes(w)).length;
    return { product: p, score: matchCount };
  });

  const filteredProducts = scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(s => s.product)
    .filter(p => {
      if (seenIds.has(p.productId)) return false;
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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function handleCors(req, res) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    return true;
  }
  return false;
}

/**
 * Authentication: Bearer Token Generation & Validation
 * Session 1: In-memory tokens (reset on deploy)
 * Session 2: Will migrate to persistent DB
 */

// In-memory token store (maps token → {agent_id, created_at})
let tokenStore = {};

// Secret for token signing (in production, use environment variable)
const TOKEN_SECRET = process.env.AUTH_TOKEN_SECRET || 'fiberagent_dev_secret_change_in_production';

// Generate a signed Bearer token for an agent
function generateAuthToken(agentId) {
  // Simple token format: base64(agent_id:timestamp:random):signature
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const tokenData = `${agentId}:${timestamp}:${random}`;
  
  // Create a simple signature (not cryptographic, just for demo)
  // In production, use: crypto.createHmac('sha256', TOKEN_SECRET).update(tokenData).digest('hex')
  const signature = Buffer.from(tokenData).toString('base64');
  
  const token = `sk_live_${signature}`;
  
  // Store token in memory (will reset on cold start — Session 2 fixes this)
  tokenStore[token] = {
    agent_id: agentId,
    created_at: new Date().toISOString(),
    valid: true
  };
  
  return token;
}

// Validate a Bearer token
function validateAuthToken(token) {
  if (!token) return null;
  
  // Remove 'Bearer ' prefix if present
  const cleanToken = token.replace(/^Bearer\s+/i, '');
  
  if (!tokenStore[cleanToken]) {
    return null; // Token not found or invalid
  }
  
  const tokenData = tokenStore[cleanToken];
  if (!tokenData.valid) {
    return null;
  }
  
  return tokenData.agent_id; // Return agent_id if valid
}

// Get Bearer token from request (from Authorization header or query param)
function getAuthToken(req) {
  // Try Authorization header first
  const authHeader = req.headers.authorization;
  if (authHeader) {
    return authHeader.replace(/^Bearer\s+/i, '');
  }
  
  // Fallback: try query parameter (less secure, for testing)
  return req.query.auth_token || req.body?.auth_token || null;
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
  handleCors,
  generateAuthToken,
  validateAuthToken,
  getAuthToken
};
