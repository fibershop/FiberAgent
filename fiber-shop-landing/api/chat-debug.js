/**
 * Debug endpoint to test product search
 */

export default async function handler(req, res) {
  const FIBER_API = 'https://api.fiber.shop/v1';
  const AGENT_ID = 'agent_c56b31fd2bd952ed214c7452';
  
  try {
    // Test Fiber directly
    const searchUrl = `${FIBER_API}/agent/search?keywords=Nike%20shoes&agent_id=${AGENT_ID}&limit=10`;
    console.log('[DEBUG] Calling:', searchUrl);
    
    const fiberRes = await fetch(searchUrl);
    const fiberData = await fiberRes.json();
    
    const products = fiberData.results
      .filter(m => m.type === 'product' && m.price)
      .slice(0, 5);
    
    console.log('[DEBUG] Got', products.length, 'products');
    
    return res.status(200).json({
      fiber_url: searchUrl,
      fiber_success: fiberData.success,
      fiber_count: fiberData.results_count,
      filtered_products: products.length,
      sample: products[0]
    });
  } catch (err) {
    return res.status(500).json({ error: err.message, stack: err.stack });
  }
}
