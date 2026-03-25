/**
 * Filter & Rank Results - Use Claude to filter products before returning
 * 
 * Takes all products from Fiber and filters down to best ones based on:
 * - User preferences and context
 * - Price and value (cashback)
 * - Ratings and reviews
 * - Relevance to request
 */

const Anthropic = require('@anthropic-ai/sdk');

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn('[FILTER] ANTHROPIC_API_KEY not set, filtering will fall back to price ranking');
}

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Filter results using Claude
 */
async function filterResults(userMessage, products, conversationHistory = []) {
  try {
    if (!products || products.length === 0) {
      return {
        success: true,
        filteredProducts: [],
        reasoning: 'No products to filter',
      };
    }

    // Fallback if API key not configured
    if (!process.env.ANTHROPIC_API_KEY) {
      console.log('[FILTER] API key not configured, using fallback (price ranking)');
      // Fallback: return top 8 by effective price
      const fallback = products.slice(0, 8).map((p, idx) => ({
        ...p,
        rank: idx + 1,
        score: 50 + (8 - idx) * 5,
      }));
      return {
        success: true,
        filteredProducts: fallback,
        reasoning: 'API key not configured, using price-based ranking fallback',
      };
    }

    const systemPrompt = `You are an expert product recommendation engine for shopping.

Your job is to filter and rank products based on:
1. Relevance to user request
2. Value (price + cashback combined)
3. Quality (ratings, reviews)
4. Practical considerations (brand reputation, stock, merchant)

User context clues from conversation:
- Gender/style hints ("men's", "women's", "unisex")
- Budget preferences ("under $100", "affordable", "premium")
- Brand preferences ("Nike", "Adidas", etc.)
- Use cases ("running", "casual", "professional")
- Size/specs if mentioned

Return a JSON object with:
{
  "topProducts": [
    {
      "id": string,
      "rank": 1-10,
      "score": 0-100,
      "reason": "Why this is a good match"
    }
  ],
  "reasoning": "Overall strategy applied"
}

Guidelines:
- Return top 8-10 products only
- Score should reflect overall value (price + cashback + quality)
- Exclude products that don't match user intent
- Boost highly rated products (4.5+ stars)
- Consider cashback as bonus value, not primary factor
- If user specified gender/style, filter aggressively
- If budget mentioned, respect it (within 10% tolerance)`;

    // Build product list for Claude
    const productSummaries = products.map(p => ({
      id: p.id,
      title: p.title,
      price: p.price,
      merchant: p.merchant,
      cashback_rate: p.cashback_rate,
      cashback_amount: p.cashback_amount,
      rating: p.rating,
      reviews_count: p.reviews_count,
      in_stock: p.in_stock,
    }));

    // Build conversation with product context
    const messages = [
      ...conversationHistory,
      {
        role: 'user',
        content: `User request: "${userMessage}"

Available products (${products.length} total):
${JSON.stringify(productSummaries, null, 2)}

Please filter to the best 8-10 products for this user.`,
      },
    ];

    const response = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1500,
      system: systemPrompt,
      messages,
    });

    const content = response.content[0].text;
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[FILTER] Could not extract JSON:', content);
      // Fallback: return top 8 by effective price
      return {
        success: true,
        filteredProducts: products.slice(0, 8),
        reasoning: 'Fallback: Could not parse Claude response, returning top by price',
      };
    }

    const result = JSON.parse(jsonMatch[0]);
    
    // Map Claude's ranking back to actual products
    const rankedProducts = result.topProducts
      .map(rec => {
        const product = products.find(p => p.id === rec.id);
        return product ? { ...product, rank: rec.rank, score: rec.score, filterReason: rec.reason } : null;
      })
      .filter(p => p !== null);

    console.log('[FILTER] Filtered to', rankedProducts.length, 'products');

    return {
      success: true,
      filteredProducts: rankedProducts,
      reasoning: result.reasoning,
    };
  } catch (err) {
    console.error('[FILTER] Error:', err.message);
    // Fallback: return top 8 by effective price
    return {
      success: false,
      filteredProducts: products.slice(0, 8),
      reasoning: `Error filtering: ${err.message}`,
    };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message = '', products = [], conversationHistory = [] } = req.body;

  if (!message || !products) {
    return res.status(400).json({ error: 'message and products required' });
  }

  try {
    const result = await filterResults(message, products, conversationHistory);
    
    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    console.error('[FILTER] Handler error:', err.message);
    return res.status(200).json({
      success: false,
      error: err.message,
      filteredProducts: products.slice(0, 8),
    });
  }
}
