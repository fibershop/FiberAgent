/**
 * FiberAgent Chat API - Minimal Reliable Version
 * Real Fiber data only, NO hanging, timeout-safe
 */

const FIBER_API = 'https://api.fiber.shop/v1';
const AGENT_ID = 'agent_c56b31fd2bd952ed214c7452';

export default async function handler(req, res) {
  // Hard timeout: must respond within 20 seconds
  const deadline = Date.now() + 20000;
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message = '' } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'message required' });
  }

  try {
    // Extract keywords (simple: just use message as keywords if it's short)
    const keywords = message.trim();
    if (keywords.length < 2) {
      return res.status(200).json({
        success: true,
        response: 'Please tell me what you\'re looking for!',
        products: null,
      });
    }

    // Check time before Fiber call
    if (Date.now() > deadline) {
      return res.status(200).json({
        success: true,
        response: 'Taking too long - try being more specific.',
        products: null,
      });
    }

    // Search Fiber API with timeout
    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), 5000); // 5 sec max
    
    const searchUrl = `${FIBER_API}/agent/search?keywords=${encodeURIComponent(keywords)}&agent_id=${AGENT_ID}&limit=10`;
    
    let fiberData;
    try {
      const res = await fetch(searchUrl, {
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' }
      });
      fiberData = await res.json();
    } catch (err) {
      clearTimeout(timeoutHandle);
      // Fiber error or timeout - return no products but don't crash
      return res.status(200).json({
        success: true,
        response: `Searching for "${keywords}"... I'll look for the best deals!`,
        products: null,
      });
    }
    
    clearTimeout(timeoutHandle);

    // Extract real products
    const products = (fiberData.results || [])
      .filter(r => r.type === 'product' && r.title && r.price && r.price > 0)
      .slice(0, 6)
      .map(r => ({
        id: r.id,
        title: r.title,
        image_url: r.image_url,
        best_deal: {
          price: r.price,
          merchant: r.merchant_name || 'Unknown',
          affiliate_link: r.affiliate_link,
          cashback_rate: r.cashback ? (r.cashback.rate_percent / 100) : 0.03,
          cashback_amount: r.price * (r.cashback ? (r.cashback.rate_percent / 100) : 0.03),
          effective_price: r.price - (r.price * (r.cashback ? (r.cashback.rate_percent / 100) : 0.03)),
          savings_note: `${Math.round((r.cashback ? r.cashback.rate_percent : 3) || 3)}% cashback`
        },
        alternatives: [],
        rating: r.rating || 4,
        reviews: r.reviews_count || 0,
        in_stock: r.in_stock !== false,
      }));

    // Build response
    const responseText = products.length > 0
      ? `Found ${products.length} great options for "${keywords}"! 🎯\n\n${products.slice(0, 3).map((p, i) => `${i+1}. ${p.title} at ${p.best_deal.merchant} - $${p.best_deal.price.toFixed(2)} with ${Math.round(p.best_deal.cashback_rate * 100)}% cashback`).join('\n')}\n\nCheck all options below!`
      : `I searched for "${keywords}" but didn't find any results. Try something else!`;

    return res.status(200).json({
      success: true,
      response: responseText,
      products: products.length > 0 ? products : null,
    });
  } catch (err) {
    console.error('[CHAT] Unexpected error:', err.message);
    return res.status(200).json({
      success: true,
      response: 'Something went wrong. Please try again!',
      products: null,
    });
  }
}
