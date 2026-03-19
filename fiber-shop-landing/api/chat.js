/**
 * FiberAgent Chat API - Multi-Source Search
 * Fiber + optional Shopify fallback
 */

const FIBER_API = 'https://api.fiber.shop/v1';
const AGENT_ID = 'agent_c56b31fd2bd952ed214c7452';

/**
 * Search Fiber API - Parse results correctly
 */
async function searchFiber(keywords) {
  try {
    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), 6000);
    
    const url = `${FIBER_API}/agent/search?keywords=${encodeURIComponent(keywords)}&agent_id=${AGENT_ID}&limit=10`;
    
    console.log(`[FIBER] Searching: ${url}`);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutHandle);
    
    console.log(`[FIBER] Status: ${res.status}`);
    if (!res.ok) {
      console.log(`[FIBER] Error: ${res.status}`);
      return [];
    }
    
    const data = await res.json();
    console.log(`[FIBER] Got response with ${data.results?.length || 0} results`);
    
    // Fiber returns "results" not "products"
    const items = data.results || [];
    
    const products = items
      .filter(p => p.title && p.price > 0)
      .map(p => ({
        id: p.id || `fiber_${Math.random()}`,
        title: p.title,
        image_url: p.image_url,
        price: p.price,
        merchant: p.merchant_name || 'Unknown',
        // Cashback is in p.cashback object
        cashback_rate: (p.cashback?.rate_percent || 0) / 100,
        cashback_amount: p.cashback?.amount_usd || 0,
        affiliate_link: p.affiliate_link,
        rating: p.rating || null,
        reviews_count: p.reviews_count || 0,
        in_stock: p.in_stock !== false,
        source: 'fiber',
      }));
    
    console.log(`[FIBER] Parsed ${products.length} valid products`);
    return products;
  } catch (err) {
    console.error('[FIBER] Error:', err.message);
    return [];
  }
}

export default async function handler(req, res) {
  const startTime = Date.now();
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message = '' } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'message required' });
  }

  try {
    const keywords = message.trim();
    console.log(`[CHAT] Message: "${keywords}"`);
    
    if (keywords.length < 2) {
      return res.status(200).json({
        success: true,
        response: 'Please tell me what you\'re looking for!',
        products: null,
      });
    }

    // Search Fiber
    const products = await searchFiber(keywords);
    
    // Sort by effective price
    products.sort((a, b) => {
      const aEff = (a.price || 0) - (a.cashback_amount || 0);
      const bEff = (b.price || 0) - (b.cashback_amount || 0);
      return aEff - bEff;
    });

    const results = products.slice(0, 6);
    console.log(`[CHAT] Returning ${results.length} products in ${Date.now() - startTime}ms`);

    // Build response text
    const responseText = results.length > 0
      ? `Found ${results.length} great options for "${keywords}"! 🎯\n\n${results.slice(0, 3).map((p, i) => `${i+1}. ${p.title} at ${p.merchant} - $${p.price.toFixed(2)} with ${(p.cashback_rate * 100).toFixed(1)}% cashback`).join('\n')}\n\nCheck all options below!`
      : `Searching for "${keywords}"... I'll look for the best deals!`;

    return res.status(200).json({
      success: true,
      response: responseText,
      products: results.length > 0 ? results : null,
    });
  } catch (err) {
    console.error('[CHAT] Error:', err.message);
    return res.status(200).json({
      success: true,
      response: 'Something went wrong. Please try again!',
      products: null,
    });
  }
}
