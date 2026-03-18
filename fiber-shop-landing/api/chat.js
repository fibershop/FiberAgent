/**
 * FiberAgent Chat API - Minimal version for product returns
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message = '' } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'message required' });
  }

  try {
    // Mock products
    const mockProducts = [
      {
        id: 'nike_af1',
        title: 'Nike Air Force 1 Low',
        image_url: 'https://via.placeholder.com/200?text=AF1',
        best_deal: {
          price: 90,
          merchant: 'Finish Line',
          affiliate_link: '#',
          cashback_rate: 0.05,
          cashback_amount: 4.5,
          effective_price: 85.5,
          savings_note: 'Best price with 5% cashback'
        },
        alternatives: [],
        rating: 4.5,
        reviews: 250,
        in_stock: true
      },
      {
        id: 'nike_am270',
        title: 'Nike Air Max 270',
        image_url: 'https://via.placeholder.com/200?text=AM270',
        best_deal: {
          price: 150,
          merchant: 'Nike.com',
          affiliate_link: '#',
          cashback_rate: 0.03,
          cashback_amount: 4.5,
          effective_price: 145.5,
          savings_note: 'Best price with 3% cashback'
        },
        alternatives: [],
        rating: 4.3,
        reviews: 180,
        in_stock: true
      },
      {
        id: 'nike_pegasus',
        title: 'Nike Pegasus 41',
        image_url: 'https://via.placeholder.com/200?text=Pegasus',
        best_deal: {
          price: 130,
          merchant: 'Nike.com',
          affiliate_link: '#',
          cashback_rate: 0.03,
          cashback_amount: 3.9,
          effective_price: 126.1,
          savings_note: 'Best price with 3% cashback'
        },
        alternatives: [],
        rating: 4.4,
        reviews: 320,
        in_stock: true
      },
      {
        id: 'nike_vomero',
        title: 'Nike Vomero 17',
        image_url: 'https://via.placeholder.com/200?text=Vomero',
        best_deal: {
          price: 170,
          merchant: 'Finish Line',
          affiliate_link: '#',
          cashback_rate: 0.05,
          cashback_amount: 8.5,
          effective_price: 161.5,
          savings_note: 'Best price with 5% cashback'
        },
        alternatives: [],
        rating: 4.2,
        reviews: 140,
        in_stock: true
      },
      {
        id: 'nike_cortez',
        title: 'Nike Cortez',
        image_url: 'https://via.placeholder.com/200?text=Cortez',
        best_deal: {
          price: 100,
          merchant: 'Target',
          affiliate_link: '#',
          cashback_rate: 0.02,
          cashback_amount: 2,
          effective_price: 98,
          savings_note: 'Good price with 2% cashback'
        },
        alternatives: [],
        rating: 4.6,
        reviews: 420,
        in_stock: true
      },
      {
        id: 'nike_revolution',
        title: 'Nike Revolution 7',
        image_url: 'https://via.placeholder.com/200?text=Revolution',
        best_deal: {
          price: 70,
          merchant: 'Walmart',
          affiliate_link: '#',
          cashback_rate: 0.01,
          cashback_amount: 0.7,
          effective_price: 69.3,
          savings_note: 'Budget-friendly with 1% cashback'
        },
        alternatives: [],
        rating: 4.1,
        reviews: 550,
        in_stock: true
      }
    ];

    // Simple response text - NO URLS, ONLY DESCRIPTION
    const responseText = `Great! I found some excellent Nike shoes with cashback rewards. Here are my top picks:

🔥 **Best Value**: Nike Air Force 1 at Finish Line - earning 5% cashback on this classic!

⚡ **Premium Pick**: Nike Air Max 270 with superior comfort - 3% cashback

🏃 **Performance**: Nike Pegasus 41 - perfect for running with 3% cashback

All of these have real cashback rewards. Just click "Shop Now" on any card to earn rewards on your purchase!`;

    return res.status(200).json({
      success: true,
      response: responseText,
      products: mockProducts,
      available_filters: {},
      trending: null,
    });
  } catch (err) {
    console.error('Chat error:', err);
    return res.status(500).json({ error: err.message });
  }
}
