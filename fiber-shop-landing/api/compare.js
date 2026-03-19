/**
 * FiberAgent Compare API - Multi-Source Aggregation
 * Combines Fiber + Shopify + Pinterest for comprehensive price comparison
 */

const FIBER_API = 'https://api.fiber.shop/v1';
const AGENT_ID = 'agent_c56b31fd2bd952ed214c7452';

// Simple Shopify store scraper (public APIs, no auth required)
const SHOPIFY_STORES = [
  'nike.com', 'adidas.com', 'footlocker.com', 'finishline.com',
  'dickssportinggoods.com', 'target.com', 'walmart.com', 'amazon.com'
];

/**
 * Search Fiber API for products with ratings
 */
async function searchFiber(keywords, limit = 6) {
  try {
    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), 5000);
    
    const url = `${FIBER_API}/agent/search?keywords=${encodeURIComponent(keywords)}&agent_id=${AGENT_ID}&limit=${limit}`;
    
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutHandle);
    
    if (!res.ok) return [];
    
    const data = await res.json();
    return (data.products || []).map(p => ({
      ...p,
      source: 'fiber',
      rating: p.rating || null, // Real ratings from Fiber if available
      reviews: p.reviews || 0,
    }));
  } catch (err) {
    console.error('Fiber search error:', err.message);
    return [];
  }
}

/**
 * Scrape Shopify stores for product availability
 * Returns product matches with pricing
 */
async function searchShopify(keywords) {
  try {
    // Fetch from a few key Shopify stores
    const results = [];
    
    // Try fetching from popular retailers
    for (const store of SHOPIFY_STORES.slice(0, 3)) { // Limit to 3 to avoid timeout
      try {
        const controller = new AbortController();
        const timeoutHandle = setTimeout(() => controller.abort(), 2000);
        
        // Use Shopify's product search API (public endpoint)
        const url = `https://${store}/search.json?q=${encodeURIComponent(keywords)}&limit=3`;
        
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutHandle);
        
        if (res.ok) {
          const data = await res.json();
          if (data.products) {
            results.push(...data.products.map(p => ({
              id: `shopify_${store}_${p.id}`,
              title: p.title,
              price: p.variants?.[0]?.price ? parseFloat(p.variants[0].price) : 0,
              image_url: p.image?.src,
              merchant: store,
              source: 'shopify',
              affiliate_link: `https://${store}/products/${p.handle}`,
              rating: null, // Shopify public API doesn't easily expose ratings
              reviews: 0,
              in_stock: p.variants?.[0]?.available ?? true,
            })));
          }
        }
      } catch (err) {
        // Skip this store, move to next
      }
    }
    
    return results;
  } catch (err) {
    console.error('Shopify search error:', err.message);
    return [];
  }
}

/**
 * Get Pinterest trending for inspiration (limited data)
 */
async function searchPinterest(keywords) {
  try {
    // Pinterest doesn't have a public API for search
    // Return empty for now; could be enhanced with web scraping if needed
    return [];
  } catch (err) {
    console.error('Pinterest search error:', err.message);
    return [];
  }
}

/**
 * Deduplicate and merge products from multiple sources
 */
function mergeAndDeduplicate(fiberProducts, shopifyProducts, pinterestProducts) {
  const productMap = new Map();
  
  // Add Fiber (primary source)
  fiberProducts.forEach(p => {
    const key = p.title?.toLowerCase().trim();
    if (key && !productMap.has(key)) {
      productMap.set(key, {
        ...p,
        alternatives: [],
      });
    }
  });
  
  // Add Shopify (alternatives)
  shopifyProducts.forEach(p => {
    const key = p.title?.toLowerCase().trim();
    const existing = productMap.get(key);
    
    if (existing) {
      // Add as alternative
      if (!existing.alternatives.find(a => a.merchant === p.merchant)) {
        existing.alternatives.push({
          price: p.price,
          merchant: p.merchant,
          affiliate_link: p.affiliate_link,
          source: 'shopify',
          in_stock: p.in_stock,
        });
      }
    } else if (!productMap.has(key)) {
      // New product
      productMap.set(key, {
        ...p,
        alternatives: [],
      });
    }
  });
  
  return Array.from(productMap.values());
}

/**
 * Main handler
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { productTitle = '', limit = 6 } = req.body;

  if (!productTitle) {
    return res.status(400).json({ error: 'productTitle required' });
  }

  try {
    // Fetch from all sources in parallel with timeouts
    const [fiberProducts, shopifyProducts, pinterestProducts] = await Promise.all([
      searchFiber(productTitle, limit),
      searchShopify(productTitle),
      searchPinterest(productTitle),
    ]);

    // Merge and deduplicate
    const merged = mergeAndDeduplicate(fiberProducts, shopifyProducts, pinterestProducts);

    // Sort by effective price (price - cashback)
    merged.sort((a, b) => {
      const aEff = (a.best_deal?.price || a.price || 0) - (a.best_deal?.cashback_amount || 0);
      const bEff = (b.best_deal?.price || b.price || 0) - (b.best_deal?.cashback_amount || 0);
      return aEff - bEff;
    });

    return res.status(200).json({
      success: true,
      products: merged.slice(0, limit),
      sources: {
        fiber: fiberProducts.length,
        shopify: shopifyProducts.length,
        pinterest: pinterestProducts.length,
      },
      total: merged.length,
    });
  } catch (err) {
    console.error('Compare error:', err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}
