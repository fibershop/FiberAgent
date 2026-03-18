/**
 * Simplified chat endpoint - for testing product rendering
 */

const mockProducts = [
  {
    id: 'nike_af1_001',
    title: 'Nike Air Force 1 Low',
    price: 90,
    merchant: 'Finish Line',
    image_url: 'https://via.placeholder.com/200?text=Air+Force+1',
    cashback_rate: 0.05,
    cashback_amount: 4.5,
    affiliate_link: '#',
    rating: 4.5,
    reviews_count: 250,
    availability: 'in_stock',
  },
  {
    id: 'nike_am270_001',
    title: 'Nike Air Max 270',
    price: 150,
    merchant: 'Nike.com',
    image_url: 'https://via.placeholder.com/200?text=Air+Max+270',
    cashback_rate: 0.03,
    cashback_amount: 4.5,
    affiliate_link: '#',
    rating: 4.3,
    reviews_count: 180,
    availability: 'in_stock',
  },
  {
    id: 'nike_pegasus_001',
    title: 'Nike Pegasus 41',
    price: 130,
    merchant: 'Nike.com',
    image_url: 'https://via.placeholder.com/200?text=Pegasus+41',
    cashback_rate: 0.03,
    cashback_amount: 3.9,
    affiliate_link: '#',
    rating: 4.4,
    reviews_count: 320,
    availability: 'in_stock',
  },
];

function formatProductForResponse(product) {
  return {
    id: product.id,
    title: product.title,
    image_url: product.image_url,
    best_deal: {
      price: product.price,
      merchant: product.merchant,
      affiliate_link: product.affiliate_link,
      cashback_rate: product.cashback_rate,
      cashback_amount: product.cashback_amount,
      effective_price: product.price - product.cashback_amount,
      savings_note: `Best price with ${Math.round(product.cashback_rate * 100)}% cashback`
    },
    alternatives: [],
    rating: product.rating,
    reviews: product.reviews_count,
    in_stock: product.availability === 'in_stock',
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'message required' });
  }

  try {
    // Simple Claude response
    const responseText = `Great! I found some Nike shoes for you. Here are some of the best deals with cashback rewards!`;

    // Format products
    const formattedProducts = mockProducts.map(formatProductForResponse);

    return res.status(200).json({
      success: true,
      response: responseText,
      products: formattedProducts,
      available_filters: {},
      trending: null,
    });
  } catch (err) {
    console.error('Chat API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
