/**
 * Trending Products API - Get real trending data from Fiber
 * 
 * When user query is vague, return what people are actually buying
 * via the Fiber network (real data, no hardcoded lists)
 */

const FIBER_API = 'https://api.fiber.shop/v1';
const AGENT_ID = 'agent_c56b31fd2bd952ed214c7452';

/**
 * Get trending products from Fiber API
 */
async function getTrends(category = 'shoes', limit = 4) {
  try {
    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), 6000);

    // Call Fiber trends endpoint
    const url = `${FIBER_API}/agent/stats/trends?days=7&limit=${limit}`;
    
    console.log(`[TRENDS] Fetching: ${url}`);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutHandle);

    if (!res.ok) {
      console.log(`[TRENDS] Error: ${res.status}`);
      return null;
    }

    const data = await res.json();
    console.log(`[TRENDS] Got response with ${data.trends?.length || 0} trends`);

    if (!data.trends || data.trends.length === 0) {
      return null;
    }

    // Transform Fiber trends into product cards
    const products = data.trends
      .slice(0, limit)
      .map((trend, idx) => ({
        id: `trend_${idx}`,
        title: trend.title || trend.product_name || 'Popular Product',
        description: trend.description || `Trending in ${category}`,
        image: trend.image_url || '🛍️',
        conversions: trend.conversions || 0,
        searches: trend.searches || 0,
        category: category,
        source: 'fiber_trends',
      }));

    return products.length > 0 ? products : null;
  } catch (err) {
    console.error('[TRENDS] Error:', err.message);
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { category = 'shoes', limit = 4 } = req.body;

  try {
    const trends = await getTrends(category, limit);

    if (!trends) {
      return res.status(200).json({
        success: true,
        trends: null,
        message: 'No trending data available',
      });
    }

    return res.status(200).json({
      success: true,
      trends,
      promptText: `🔥 Here's what people are buying right now:`,
    });
  } catch (err) {
    console.error('[TRENDS] Handler error:', err.message);
    return res.status(200).json({
      success: false,
      error: err.message,
      trends: null,
    });
  }
}
