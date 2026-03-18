/**
 * Test endpoint - returns hardcoded products to verify deployment
 */

export default function handler(req, res) {
  const mockProducts = [
    {
      id: 'test_1',
      title: 'Nike Air Force 1',
      image_url: 'https://via.placeholder.com/200',
      best_deal: {
        price: 120,
        merchant: 'Nike',
        affiliate_link: 'https://nike.com/af1',
        cashback_rate: 0.05,
        cashback_amount: 6,
        effective_price: 114,
        savings_note: 'Best price with 5% cashback'
      },
      alternatives: [],
      rating: 4.5,
      reviews: 250,
      in_stock: true
    },
    {
      id: 'test_2',
      title: 'Nike Air Max 270',
      image_url: 'https://via.placeholder.com/200',
      best_deal: {
        price: 150,
        merchant: 'Amazon',
        affiliate_link: 'https://amazon.com/airmax',
        cashback_rate: 0.03,
        cashback_amount: 4.5,
        effective_price: 145.5,
        savings_note: 'Good price with 3% cashback'
      },
      alternatives: [],
      rating: 4.3,
      reviews: 180,
      in_stock: true
    }
  ];

  res.status(200).json({
    success: true,
    response: 'Test products loaded',
    products: mockProducts,
    available_filters: {},
    trending: null,
    current_filters: {}
  });
}
