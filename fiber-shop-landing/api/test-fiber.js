/**
 * Direct Fiber API test - no Claude, just raw search
 */

export default async function handler(req, res) {
  const FIBER_API = 'https://api.fiber.shop/v1';
  const AGENT_ID = 'agent_c56b31fd2bd952ed214c7452';

  try {
    const keywords = 'Nike shoes';
    const url = `${FIBER_API}/agent/search?keywords=${encodeURIComponent(keywords)}&agent_id=${AGENT_ID}&limit=10`;
    
    const searchRes = await fetch(url);
    const data = await searchRes.json();
    
    const products = data.results
      .filter(r => r.type === 'product' && r.price && r.price > 0)
      .slice(0, 6)
      .map((r, idx) => ({
        id: r.id,
        title: r.title,
        price: r.price,
        merchant: r.merchant_name,
        image_url: r.image_url,
        cashback_rate: r.cashback ? (r.cashback.rate_percent / 100) : 0.03,
        cashback_amount: r.price * (r.cashback ? (r.cashback.rate_percent / 100) : 0.03),
      }));

    return res.status(200).json({
      success: true,
      response: `Found ${products.length} Nike shoes`,
      products: products,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
