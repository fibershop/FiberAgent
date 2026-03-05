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
            affiliate_link: m.affiliate_link || buildAffiliateLink(m.merchant_domain),
          }));
        }
      } catch (err) {
        console.error('Fiber search error:', err.message);
      }
    }

    // Build context for Claude
    const systemPrompt = `You are FiberAgent, a friendly AI shopping assistant. Your job is to help users find products and deals with cashback rewards across 50,000+ merchants.

Key traits:
- Be conversational and natural, like chatting with a friend
- Ask clarifying questions if needed (budget, preferences, etc.)
- When you search products, explain why they're good deals
- Always mention the cashback rewards available
- Be enthusiastic about helping them save money

${fibreResults.length > 0 ? `
Available merchants for "${searchKeywords}":
${fibreResults.map((m, i) => `${i + 1}. ${m.merchant} (${m.domain}) - ${m.cashback} cashback`).join('\n')}
` : ''}

Focus on being helpful and conversational first. Product listings are secondary.`;

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
    'best', 'laptop', 'shoes', 'phone', 'headphones', 'watch', 'camera',
    'nike', 'amazon', 'best buy', 'target', 'walmart', 'electronics',
    'fashion', 'clothing', 'price', 'deal', 'cashback', 'save money',
  ];

  const hasShoppingIntent = shoppingKeywords.some(k => lowerMsg.includes(k));
  if (!hasShoppingIntent) return null;

  // Try to extract the product/brand they're looking for
  const patterns = [
    /(?:find|search|show|looking for|want|need|recommend)\s+(?:me\s+)?(.+?)(?:\?|$|under|below|with|for)/i,
    /(?:best|top)\s+(.+?)(?:\?|$|under|with|for)/i,
    /(\w+(?:\s+\w+)?)\s+(?:shoes|laptop|phone|headphones|watch|camera|keyboard|monitor|graphics card)/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
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
