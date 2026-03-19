/**
 * FiberAgent Chat API - Search + Timeout Resilience
 * Tries Fiber first, adds Shopify if time permits
 */

const FIBER_API = 'https://api.fiber.shop/v1';
const AGENT_ID = 'agent_c56b31fd2bd952ed214c7452';

/**
 * Search Fiber API - Simple, reliable
 */
async function searchFiber(keywords) {
  try {
    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), 5000);
    
    const url = `${FIBER_API}/agent/search?keywords=${encodeURIComponent(keywords)}&agent_id=${AGENT_ID}&limit=10`;
    
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutHandle);
    
    if (!res.ok) {
      console.log('Fiber API returned', res.status);
      return [];
    }
    
    const data = await res.json();
    console.log('Fiber response:', { hasProducts: !!data.products, count: data.products?.length });
    
    // Handle different response formats
    const items = data.products || data.results || [];
    
    return items
      .filter(p => p.title && p.best_deal?.price > 0)
      .map(p => ({
        id: p.id || `fiber_${Math.random()}`,
        title: p.title,
        image_url: p.image_url || p.image,
        price: p.best_deal.price,
        merchant: p.best_deal.merchant || 'Fiber',
        cashback_rate: p.best_deal.cashback_rate || 0.03,
        cashback_amount: p.best_deal.cashback_amount || 0,
        affiliate_link: p.best_deal.affiliate_link,
        rating: p.rating || null,
        reviews_count: p.reviews_count || p.reviews || 0,
        source: 'fiber',
      }));
  } catch (err) {
    console.error('Fiber search failed:', err.message);
    return [];
  }
}

/**
 * Search single Shopify store (quick)
 */
async function searchShopifyStore(store, keywords) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1000);
    
    const url = `https://${store}/search.json?q=${encodeURIComponent(keywords)}&limit=2`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    
    if (!res.ok) return [];
    
    const data = await res.json();
    if (!data.products || !Array.isArray(data.products)) return [];
    
    return data.products
      .filter(p => p.variants?.[0]?.price)
      .map(p => ({
        id: `shopify_${store}_${p.id}`,
        title: p.title,
        image_url: p.image?.src,
        price: parseFloat(p.variants[0].price),
        merchant: store.replace('.com', '').toUpperCase(),
        cashback_rate: 0.01,
        cashback_amount: parseFloat(p.variants[0].price) * 0.01,
        affiliate_link: `https://${store}/products/${p.handle}`,
        rating: null,
        reviews_count: 0,
        source: 'shopify',
      }));
  } catch (err) {
    return [];
  }
}

/**
 * Try to get Shopify products (time-limited)
 */
async function searchShopify(keywords, timeLimit = 3000) {
  const deadline = Date.now() + timeLimit;
  const stores = ['nike.com', 'amazon.com', 'target.com'];
  const results = [];
  
  for (const store of stores) {
    if (Date.now() > deadline) break;
    const products = await searchShopifyStore(store, keywords);
    results.push(...products);
  }
  
  return results;
}

/**
 * Deduplicate products by title
 */
function dedupeAndMerge(fiber, shopify) {
  const map = new Map();
  
  // Add Fiber first (priority)
  fiber.forEach(p => {
    const key = (p.title || '').toLowerCase().trim();
    if (key) map.set(key, p);
  });
  
  // Add Shopify if not duplicate
  shopify.forEach(p => {
    const key = (p.title || '').toLowerCase().trim();
    if (key && !map.has(key)) {
      map.set(key, p);
    }
  });
  
  return Array.from(map.values());
}

export default async function handler(req, res) {
  const startTime = Date.now();
  const deadline = startTime + 12000; // 12 sec hard limit
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message = '' } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'message required' });
  }

  try {
    const keywords = message.trim();
    if (keywords.length < 2) {
      return res.status(200).json({
        success: true,
        response: 'Please tell me what you\'re looking for!',
        products: null,
      });
    }

    // Search Fiber first (critical)
    console.log(`[CHAT] Searching for: ${keywords}`);
    const fiberProducts = await searchFiber(keywords);
    console.log(`[CHAT] Fiber returned ${fiberProducts.length} products`);
    
    // If Fiber has products, try Shopify in parallel (if time permits)
    let allProducts = [...fiberProducts];
    
    if (fiberProducts.length > 0 && Date.now() < deadline - 3000) {
      console.log(`[CHAT] Adding Shopify products...`);
      const shopifyProducts = await searchShopify(keywords, 3000);
      console.log(`[CHAT] Shopify returned ${shopifyProducts.length} products`);
      allProducts = dedupeAndMerge(fiberProducts, shopifyProducts);
    }

    // Sort by effective price
    allProducts.sort((a, b) => {
      const aEff = (a.price || 0) - (a.cashback_amount || 0);
      const bEff = (b.price || 0) - (b.cashback_amount || 0);
      return aEff - bEff;
    });

    const products = allProducts.slice(0, 6);
    console.log(`[CHAT] Returning ${products.length} products`);

    // Build response text
    const responseText = products.length > 0
      ? `Found ${products.length} great options for "${keywords}"! 🎯\n\n${products.slice(0, 3).map((p, i) => `${i+1}. ${p.title} at ${p.merchant} - $${p.price.toFixed(2)} with ${Math.round((p.cashback_rate || 0.01) * 100)}% cashback`).join('\n')}\n\nCheck all options below!`
      : `Searching for "${keywords}"... I'll look for the best deals!`;

    return res.status(200).json({
      success: true,
      response: responseText,
      products: products.length > 0 ? products : null,
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
