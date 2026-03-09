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

  const { message, conversationHistory = [] } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'message required' });
  }

  try {
    // Check if message is a product search query
    const searchKeywords = extractSearchKeywords(message);
    let fibreResults = [];

    if (searchKeywords) {
      try {
        const searchRes = await fetch(
          `${FIBER_API}/agent/search?keywords=${encodeURIComponent(searchKeywords)}&agent_id=agent_c56b31fd2bd952ed214c7452&limit=5`,
          { method: 'GET', headers: { 'Content-Type': 'application/json' } }
        );
        const data = await searchRes.json();
        if (data.success && data.results) {
          fibreResults = data.results.slice(0, 5).map(m => ({
            merchant: m.merchant_name,
            domain: m.merchant_domain,
            cashback: m.cashback?.display || '5%',
            image_url: m.image_url || getMerchantFavicon(m.merchant_domain),
            affiliate_link: m.affiliate_link || buildAffiliateLink(m.merchant_domain),
          }));
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
