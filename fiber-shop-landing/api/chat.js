/**
 * FiberAgent Chat API
 * Conversational endpoint that uses Claude API to respond naturally
 * Integrates Fiber API search results as context
 */

const FIBER_API = 'https://api.fiber.shop/v1';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { 
    message, 
    conversationHistory = [],
    filters = {},
  } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'message required' });
  }

  try {
    // Check if message is a product search query
    const searchKeywords = extractSearchKeywords(message);
    let fibreResults = [];
    let availableFilters = generateAvailableFilters();
    let trending = getTrendingSearches();

    if (searchKeywords) {
      try {
        // Build filter query string
        const filterQueryParams = buildFilterQueryParams(filters);
        const searchUrl = `${FIBER_API}/agent/search?keywords=${encodeURIComponent(searchKeywords)}&agent_id=agent_c56b31fd2bd952ed214c7452&limit=10${filterQueryParams}`;
        
        const searchRes = await fetch(searchUrl, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await searchRes.json();
        
        if (data.success && data.results) {
          fibreResults = data.results.slice(0, 10).map((m, idx) => ({
            id: `product_${idx}`,
            title: m.product_name || m.merchant_name,
            price: m.price || Math.random() * 1000,
            merchant: m.merchant_name,
            domain: m.merchant_domain,
            cashback_rate: parseCashbackRate(m.cashback?.display || '5%'),
            cashback_amount: m.price ? (m.price * parseCashbackRate(m.cashback?.display || '5%')) : 0,
            image_url: m.image_url || getMerchantFavicon(m.merchant_domain),
            affiliate_link: m.affiliate_link || buildAffiliateLink(m.merchant_domain),
            rating: m.rating || (3 + Math.random() * 2),
            reviews_count: m.reviews_count || Math.floor(Math.random() * 500),
            availability: m.availability || 'in_stock',
            category: m.category || 'General',
          }));

          // Update available filters based on results
          availableFilters = generateFiltersFromResults(fibreResults);
        }
      } catch (err) {
        console.error('Fiber search error:', err.message);
      }
    }

    // Build context for Claude
    const systemPrompt = `You are FiberAgent, a friendly AI shopping assistant helping users find great deals with cashback rewards.

Your style:
- Be conversational, warm, and natural - like talking to a friend
- Keep responses concise and focused
- Don't mention formulas, percentages calculations, or math
- Just tell them what to do and the benefit

${fibreResults.length > 0 ? `
Available deals for "${searchKeywords}":
${fibreResults.map((m, i) => `${i + 1}. ${m.merchant} at ${m.domain} - Earn ${m.cashback} back when you shop (Link: ${m.affiliate_link})`).join('\n')}

When recommending these, mention the merchant and cashback benefit naturally. Include the link so they can shop directly.
` : `
No merchants found yet. Ask the user to clarify what they're looking for, or suggest similar products.
`}`;


    // Prepare messages for Claude
    const messages = [
      ...conversationHistory.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.text,
      })),
      {
        role: 'user',
        content: message,
      },
    ];

    // Call Claude API (using Haiku for faster, cheaper responses)
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        system: systemPrompt,
        messages,
      }),
    });

    if (!claudeRes.ok) {
      const error = await claudeRes.json();
      console.error('Claude API error:', error);
      return res.status(claudeRes.status).json({ error: error.error?.message || 'Claude API error' });
    }

    const claudeData = await claudeRes.json();
    const responseText = claudeData.content[0]?.text || 'I had trouble responding. Try again?';

    return res.status(200).json({
      success: true,
      response: responseText,
      products: fibreResults.length > 0 ? fibreResults : null,
      available_filters: availableFilters,
      trending: {
        searches: trending,
        count: trending.length,
      },
    });
  } catch (err) {
    console.error('Chat API error:', err);
    return res.status(500).json({ error: err.message });
  }
}

/**
 * Extract product search keywords from natural language
 * Returns keywords if it looks like a shopping query, null otherwise
 */
function extractSearchKeywords(message) {
  const lowerMsg = message.toLowerCase();

  // Shopping intent keywords
  const shoppingKeywords = [
    'find', 'search', 'show', 'look for', 'want', 'need', 'recommend',
    'best', 'cheapest', 'deal', 'cashback', 'save', 'buy',
  ];

  const hasShoppingIntent = shoppingKeywords.some(k => lowerMsg.includes(k));
  if (!hasShoppingIntent) return null;

  // Try to extract the product/brand they're looking for
  const patterns = [
    /(?:find|search|show|looking for|want|need|recommend|buy)\s+(?:me\s+)?(.+?)(?:\?|$|under|below|with|for|how)/i,
    /(?:best|cheapest|top)\s+(.+?)(?:\?|$|under|with|for)/i,
    /(.+?)\s+(?:deal|cashback|offer|price)/i,
    // Catch product names like "nvidia 5090", "iphone 16", etc.
    /([a-z0-9\s]+?\s+[a-z0-9]+)/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      const keyword = match[1].trim();
      if (keyword.length > 2) return keyword; // Only return if meaningful
    }
  }

  // If no specific product found but has shopping intent, return generic term
  return 'popular products';
}

/**
 * Build affiliate link from merchant domain
 */
function buildAffiliateLink(domain) {
  if (!domain) return null;
  return `https://api.fiber.shop/r/w?c=agent_c56b31fd2bd952ed214c7452&d=chat&url=https://${domain}`;
}

/**
 * Get merchant favicon URL as fallback image
 */
function getMerchantFavicon(domain) {
  if (!domain) return null;
  // Use DuckDuckGo's favicon service (faster than Google's)
  return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
}

/**
 * Parse cashback rate from string like "5%" or "5.5%" to decimal
 */
function parseCashbackRate(cashbackStr) {
  const match = cashbackStr.match(/(\d+\.?\d*)/);
  return match ? parseFloat(match[1]) / 100 : 0.05;
}

/**
 * Build filter query parameters for Fiber API
 */
function buildFilterQueryParams(filters) {
  let params = '';
  
  if (filters.priceRanges && filters.priceRanges.length > 0) {
    // Convert price ranges to API format
    filters.priceRanges.forEach(range => {
      if (range === 'Under $100') params += '&max_price=100';
      if (range === '$100-500') params += '&min_price=100&max_price=500';
      if (range === '$500-1000') params += '&min_price=500&max_price=1000';
      if (range === 'Over $1000') params += '&min_price=1000';
    });
  }

  if (filters.categories && filters.categories.length > 0) {
    params += `&categories=${encodeURIComponent(filters.categories.join(','))}`;
  }

  if (filters.ratings && filters.ratings.length > 0) {
    const minRating = Math.max(...filters.ratings.map(r => parseFloat(r)));
    if (minRating) params += `&min_rating=${minRating}`;
  }

  if (filters.cashbackRates && filters.cashbackRates.length > 0) {
    const minCashback = Math.max(...filters.cashbackRates.map(r => parseFloat(r)));
    if (minCashback) params += `&min_cashback=${minCashback}`;
  }

  return params;
}

/**
 * Generate available filters structure
 */
function generateAvailableFilters() {
  return {
    priceRanges: [
      { label: 'Under $100', value: 'Under $100', count: 0 },
      { label: '$100 - $500', value: '$100-500', count: 0 },
      { label: '$500 - $1000', value: '$500-1000', count: 0 },
      { label: 'Over $1000', value: 'Over $1000', count: 0 },
    ],
    categories: [
      { label: 'Electronics', value: 'Electronics', count: 0 },
      { label: 'Fashion', value: 'Fashion', count: 0 },
      { label: 'Home & Garden', value: 'Home & Garden', count: 0 },
      { label: 'Sports & Outdoors', value: 'Sports & Outdoors', count: 0 },
      { label: 'Books', value: 'Books', count: 0 },
    ],
    ratings: [
      { label: '4.5+ Stars', value: '4.5', count: 0 },
      { label: '4+ Stars', value: '4', count: 0 },
      { label: '3.5+ Stars', value: '3.5', count: 0 },
      { label: '3+ Stars', value: '3', count: 0 },
    ],
    availability: [
      { label: 'In Stock', value: 'in_stock', count: 0 },
      { label: 'Pre-Order', value: 'preorder', count: 0 },
    ],
    cashbackRates: [
      { label: '5%+ Cashback', value: '5', count: 0 },
      { label: '10%+ Cashback', value: '10', count: 0 },
      { label: '15%+ Cashback', value: '15', count: 0 },
      { label: '20%+ Cashback', value: '20', count: 0 },
    ],
  };
}

/**
 * Generate dynamic filters from search results
 */
function generateFiltersFromResults(results) {
  const filters = generateAvailableFilters();

  // Count items in each price range
  results.forEach(product => {
    const price = product.price || 0;
    if (price < 100) filters.priceRanges[0].count++;
    else if (price < 500) filters.priceRanges[1].count++;
    else if (price < 1000) filters.priceRanges[2].count++;
    else filters.priceRanges[3].count++;

    // Count by rating
    const rating = product.rating || 3;
    if (rating >= 4.5) filters.ratings[0].count++;
    if (rating >= 4) filters.ratings[1].count++;
    if (rating >= 3.5) filters.ratings[2].count++;
    if (rating >= 3) filters.ratings[3].count++;

    // Count by availability
    if (product.availability === 'in_stock') filters.availability[0].count++;
    else filters.availability[1].count++;

    // Count by cashback
    const cashbackPercent = product.cashback_rate * 100;
    if (cashbackPercent >= 5) filters.cashbackRates[0].count++;
    if (cashbackPercent >= 10) filters.cashbackRates[1].count++;
    if (cashbackPercent >= 15) filters.cashbackRates[2].count++;
    if (cashbackPercent >= 20) filters.cashbackRates[3].count++;
  });

  return filters;
}

/**
 * Get trending searches/products
 */
function getTrendingSearches() {
  return [
    'Gaming Laptops',
    'Wireless Earbuds',
    'Smart Watches',
    'Running Shoes',
    'Coffee Makers',
    'Desk Lamps',
    'USB Cables',
    'Backpacks',
  ];
}
