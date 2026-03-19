/**
 * FiberAgent Chat API - Multi-Source Search
 * Aggregates from Fiber + Shopify + Pinterest
 */

const FIBER_API = 'https://api.fiber.shop/v1';
const AGENT_ID = 'agent_c56b31fd2bd952ed214c7452';

const SHOPIFY_STORES = [
  'nike.com', 'adidas.com', 'footlocker.com', 'finishline.com',
  'dickssportinggoods.com', 'target.com', 'walmart.com', 'amazon.com',
  'bestbuy.com', 'newegg.com', 'bhphotovideo.com'
];

/**
 * Search Fiber API
 */
async function searchFiber(keywords, limit = 8) {
  try {
    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), 4000);
    
    const url = `${FIBER_API}/agent/search?keywords=${encodeURIComponent(keywords)}&agent_id=${AGENT_ID}&limit=${limit}`;
    
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutHandle);
    
    if (!res.ok) return [];
    
    const data = await res.json();
    return (data.products || data.results || [])
      .filter(p => p.title && p.best_deal?.price > 0)
      .map(p => ({
        ...p,
        source: 'fiber',
        id: p.id || `fiber_${Math.random()}`,
        title: p.title,
        image_url: p.image_url || p.image,
        price: p.best_deal?.price || p.price || 0,
        merchant: p.best_deal?.merchant || p.merchant || 'Fiber',
        cashback_rate: p.best_deal?.cashback_rate || 0.03,
        cashback_amount: p.best_deal?.cashback_amount || 0,
        affiliate_link: p.best_deal?.affiliate_link || p.affiliate_link,
      }));
  } catch (err) {
    console.error('Fiber search error:', err.message);
    return [];
  }
}

/**
 * Search Shopify stores
 */
async function searchShopify(keywords, limit = 4) {
  try {
    const results = [];
    
    // Search 3-4 major stores (limit 1000ms per store)
    for (const store of SHOPIFY_STORES.slice(0, 4)) {
      try {
        const controller = new AbortController();
        const timeoutHandle = setTimeout(() => controller.abort(), 1500);
        
        const url = `https://${store}/search.json?q=${encodeURIComponent(keywords)}&limit=3`;
        
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutHandle);
        
        if (res.ok) {
          const data = await res.json();
          if (data.products && Array.isArray(data.products)) {
            data.products.forEach(p => {
              const price = p.variants?.[0]?.price ? parseFloat(p.variants[0].price) : 0;
              if (price > 0) {
                results.push({
                  id: `shopify_${store}_${p.id}`,
                  title: p.title,
                  image_url: p.image?.src,
                  price: price,
                  merchant: store.replace('.com', '').toUpperCase(),
                  source: 'shopify',
                  cashback_rate: 0.01, // Default 1% for Shopify
                  cashback_amount: price * 0.01,
                  affiliate_link: `https://${store}/products/${p.handle}`,
                  rating: null,
                  reviews: 0,
                });
              }
            });
          }
        }
      } catch (err) {
        // Skip this store
      }
    }
    
    return results.slice(0, limit * 2);
  } catch (err) {
    console.error('Shopify search error:', err.message);
    return [];
  }
}

/**
 * Merge and deduplicate products
 */
function mergeProducts(fiber, shopify) {
  const map = new Map();
  
  // Add Fiber first (priority)
  fiber.forEach(p => {
    const key = (p.title || '').toLowerCase().trim();
    if (key && !map.has(key)) {
      map.set(key, p);
    }
  });
  
  // Add Shopify as alternatives
  shopify.forEach(p => {
    const key = (p.title || '').toLowerCase().trim();
    const existing = map.get(key);
    
    if (existing) {
      // Add to alternatives
      if (!existing.alternatives) existing.alternatives = [];
      if (!existing.alternatives.find(a => a.merchant === p.merchant)) {
        existing.alternatives.push({
          price: p.price,
          merchant: p.merchant,
          affiliate_link: p.affiliate_link,
          source: 'shopify',
          cashback_rate: p.cashback_rate,
        });
      }
    } else {
      map.set(key, p);
    }
  });
  
  return Array.from(map.values());
}

export default async function handler(req, res) {
  // Hard timeout: must respond within 15 seconds
  const deadline = Date.now() + 15000;
  
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

    if (Date.now() > deadline) {
      return res.status(200).json({
        success: true,
        response: 'Taking too long - try being more specific.',
        products: null,
      });
    }

    // Search all sources in parallel
    const [fiberProducts, shopifyProducts] = await Promise.all([
      searchFiber(keywords, 8),
      searchShopify(keywords, 4),
    ]);

    // Merge results
    let merged = mergeProducts(fiberProducts, shopifyProducts);
    
    // Sort by effective price (price - cashback)
    merged.sort((a, b) => {
      const aEff = (a.price || 0) - (a.cashback_amount || 0);
      const bEff = (b.price || 0) - (b.cashback_amount || 0);
      return aEff - bEff;
    });

    // Limit to 6 for display
    const products = merged.slice(0, 6);

    // Build response
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
