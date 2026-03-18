/**
 * Phase 2 Chat API Tests & Examples
 * Demonstrates:
 * 1. Multi-source search
 * 2. Smart Pinterest trending
 * 3. Best deal highlighting
 * 4. Per-conversation filter state
 */

// Mock examples for testing

/**
 * TEST 1: Vague Query with Pinterest Trending
 * Query: "shoes"
 * Expected: Show trending, fetch Pinterest recommendations
 */
const test1_vague_query = {
  request: {
    message: "Show me shoes",
    conversationHistory: [],
    filters: {},
  },
  expected_response: {
    // Response format
    success: true,
    response: "Here are some trending shoes...",
    
    // 4-6 products, sorted by effective price
    products: [
      {
        id: "fiber_0_1234567890",
        title: "Nike Run Defy",
        image_url: "https://icons.duckduckgo.com/ip3/nike.com.ico",
        best_deal: {
          price: 65,
          merchant: "Nike",
          affiliate_link: "https://api.fiber.shop/r/w?...",
          cashback_rate: 0.05,
          cashback_amount: 3.25,
          effective_price: 61.75, // Best deal: 65 - 3.25
          savings_note: "Best price with 5% cashback",
        },
        alternatives: [],
        rating: 4.5,
        reviews: 128,
        in_stock: true,
      },
      // More products...
    ],
    
    // Available filters from results
    available_filters: {
      priceRanges: [
        { label: "Under $100", value: "Under $100", count: 8 },
        { label: "$100 - $500", value: "$100-500", count: 3 },
        // ...
      ],
      // ...
    },
    
    // Pinterest trending for vague query
    trending: {
      category: "shoes",
      trend_text: "Running & Sneakers trending",
      hashtags: ["#shoes", "#shoesStyle", "#shoesTrending"],
      pinterest_url: "https://www.pinterest.com/search/pins/?q=shoes",
    },
    
    current_filters: {},
  },
};

/**
 * TEST 2: Specific Query with NO Trending
 * Query: "Nike Air Max 270"
 * Expected: NO trending (too specific), multi-source results
 */
const test2_specific_query = {
  request: {
    message: "Find me Nike Air Max 270",
    conversationHistory: [],
    filters: {},
  },
  expected_behavior: {
    // shouldFetchTrending() returns false
    trending_fetched: false,
    trending: null,
    
    // But still returns best deals from multiple sources
    products: [
      {
        title: "Nike Air Max 270 - Nike.com",
        merchant: "Nike",
        price: 129.99,
        cashback_rate: 0.05,
        effective_price: 123.49, // 129.99 - (129.99 * 0.05)
        source: "fiber",
      },
      {
        title: "Nike Air Max 270 - Amazon",
        merchant: "Amazon",
        price: 119.99,
        cashback_rate: 0.03,
        effective_price: 116.39, // 119.99 - (119.99 * 0.03)
        source: "shopify",
      },
      {
        title: "Nike Air Max 270 - ASOS",
        merchant: "ASOS",
        price: 125,
        cashback_rate: 0.02,
        effective_price: 122.50, // 125 - (125 * 0.02)
        source: "shopify",
      },
    ],
    
    // Products sorted by effective price (best deal first)
    best_deal_at_index_0: true,
    expected_order: [
      "Amazon ($116.39 effective)",
      "Nike.com ($123.49 effective)",
      "ASOS ($122.50 effective)",
    ],
  },
};

/**
 * TEST 3: Multi-source Price Comparison
 * Query: "running shoes under $200"
 * Expected: Best deal highlighting with effective price
 */
const test3_price_comparison = {
  request: {
    message: "running shoes under $200",
    conversationHistory: [],
    filters: { price_max: 200, category: "Running" },
  },
  expected_response: {
    // Filter state updated
    current_filters: {
      price_max: 200,
      category: "Running",
    },
    
    // Products from multiple sources
    products: [
      {
        title: "ASICS Gel-Lyte III",
        best_deal: {
          price: 85,
          merchant: "Best Buy",
          cashback_rate: 0.08,
          cashback_amount: 6.80,
          effective_price: 78.20, // Lowest = best deal highlighted
          savings_note: "Best price with 8% cashback",
        },
        alternatives: [
          {
            merchant: "Nike",
            price: 89,
            cashback_rate: 0.05,
            effective_price: 84.55,
          },
          {
            merchant: "Amazon",
            price: 87,
            cashback_rate: 0.03,
            effective_price: 84.39,
          },
        ],
      },
    ],
  },
};

/**
 * TEST 4: Per-conversation Filter State Management
 * Query 1: "laptops"
 * Query 2: "gaming" (filter state carries over)
 * Expected: Filters refine across conversation
 */
const test4_filter_state = {
  conversation: [
    {
      step: 1,
      user_message: "Show me laptops under $1000",
      filters_before: {},
      filters_after: { price_max: 1000, category: "Computers" },
      trending: { category: "laptop", trend_text: "Tech Gadgets trending" },
    },
    {
      step: 2,
      user_message: "gaming ones",
      filters_before: { price_max: 1000, category: "Computers" },
      filters_after: { price_max: 1000, category: "Gaming", category_original: "Computers" },
      trending: null, // "gaming" + "laptops" is too specific now
    },
    {
      step: 3,
      user_message: "reset filters",
      filters_before: { price_max: 1000, category: "Gaming" },
      filters_after: {}, // Cleared
    },
  ],
};

/**
 * TEST 5: Helper Functions
 */

// 1. shouldFetchTrending() - Smart detection
const trending_detection_tests = [
  { query: "shoes", should_fetch: true, reason: "vague, 1 word" },
  { query: "running shoes", should_fetch: true, reason: "vague, generic 2 words" },
  { query: "Nike Air Max 270", should_fetch: false, reason: "specific brand + model" },
  { query: "gaming laptop RTX 4090", should_fetch: false, reason: "specific model/specs" },
  { query: "laptop under $500", should_fetch: false, reason: "has price mention" },
  { query: "best gaming chairs", should_fetch: false, reason: "has 'best' (comparison)" },
];

// 2. calculateEffectivePrice() - Real cost to customer
const effective_price_tests = [
  {
    product: { price: 100, cashback_rate: 0.05 },
    expected_effective: 95.00,
    savings: "$5.00",
  },
  {
    product: { price: 200, cashback_rate: 0.10 },
    expected_effective: 180.00,
    savings: "$20.00",
  },
  {
    product: { price: 75.50, cashback_rate: 0.08 },
    expected_effective: 69.46,
    savings: "$6.04",
  },
];

// 3. updateFilterState() - Extract intent from message
const filter_extraction_tests = [
  {
    message: "Show me running shoes under $200",
    expected_filters: { price_max: 200, category: "Running" },
  },
  {
    message: "Nike shoes, min $50",
    expected_filters: { brand: "Nike", price_min: 50 },
  },
  {
    message: "I want a gaming laptop over $1000",
    expected_filters: { category: "Gaming", price_min: 1000 },
  },
  {
    message: "reset filters",
    expected_filters: {}, // Cleared
  },
];

/**
 * TEST 6: Response Format Example
 * Full API response showing all Phase 2 features
 */
const test6_full_response = {
  request: {
    message: "What are the best running shoes under $150?",
    conversationHistory: [
      { type: "user", text: "Hi, I'm looking for shoes" },
      { type: "assistant", text: "Great! What kind of shoes?" },
    ],
    filters: {},
  },
  
  response: {
    success: true,
    
    // Natural language response
    response: `I found some great running shoes under $150! The best deal is the ASICS Gel-Lyte III at Best Buy for $85 with 8% cashback - that saves you $6.80. I also found similar options on Nike and Amazon if you prefer those retailers. All are highly rated and in stock right now. 🏃`,
    
    // Top 6 products, sorted by effective price (best deal first)
    products: [
      {
        id: "fiber_0_1710771000",
        title: "ASICS Gel-Lyte III",
        image_url: "https://icons.duckduckgo.com/ip3/bestbuy.com.ico",
        best_deal: {
          price: 85,
          merchant: "Best Buy",
          affiliate_link: "https://api.fiber.shop/r/w?c=agent_c56b31fd2bd952ed214c7452&d=chat&url=https://bestbuy.com",
          cashback_rate: 0.08,
          cashback_amount: 6.80,
          effective_price: 78.20,
          savings_note: "Best price with 8% cashback",
        },
        alternatives: [],
        rating: 4.6,
        reviews: 234,
        in_stock: true,
      },
      {
        id: "fiber_1_1710771001",
        title: "Nike Revolution 6",
        image_url: "https://icons.duckduckgo.com/ip3/nike.com.ico",
        best_deal: {
          price: 89,
          merchant: "Nike",
          affiliate_link: "https://api.fiber.shop/r/w?c=agent_c56b31fd2bd952ed214c7452&d=chat&url=https://nike.com",
          cashback_rate: 0.05,
          cashback_amount: 4.45,
          effective_price: 84.55,
          savings_note: "Best price with 5% cashback",
        },
        alternatives: [],
        rating: 4.3,
        reviews: 189,
        in_stock: true,
      },
      {
        id: "shopify_amazon_1710771002",
        title: "New Balance 520",
        image_url: "https://icons.duckduckgo.com/ip3/amazon.com.ico",
        best_deal: {
          price: 92,
          merchant: "Amazon",
          affiliate_link: "https://api.fiber.shop/r/w?c=agent_c56b31fd2bd952ed214c7452&d=chat&url=https://amazon.com",
          cashback_rate: 0.03,
          cashback_amount: 2.76,
          effective_price: 89.24,
          savings_note: "Price available with 3% cashback",
        },
        alternatives: [],
        rating: 4.2,
        reviews: 156,
        in_stock: true,
      },
    ],
    
    // Dynamic filters from results
    available_filters: {
      priceRanges: [
        { label: "Under $100", value: "Under $100", count: 12 },
        { label: "$100 - $500", value: "$100-500", count: 8 },
        { label: "$500 - $1000", value: "$500-1000", count: 0 },
        { label: "Over $1000", value: "Over $1000", count: 0 },
      ],
      categories: [
        { label: "Running", value: "Running", count: 15 },
        { label: "Casual", value: "Casual", count: 5 },
        { label: "Formal", value: "Formal", count: 0 },
      ],
      ratings: [
        { label: "4.5+ Stars", value: "4.5", count: 10 },
        { label: "4+ Stars", value: "4", count: 18 },
        { label: "3.5+ Stars", value: "3.5", count: 20 },
      ],
      availability: [
        { label: "In Stock", value: "in_stock", count: 20 },
        { label: "Pre-Order", value: "preorder", count: 0 },
      ],
      cashbackRates: [
        { label: "5%+ Cashback", value: "5", count: 12 },
        { label: "10%+ Cashback", value: "10", count: 5 },
        { label: "15%+ Cashback", value: "15", count: 1 },
      ],
    },
    
    // Pinterest trending for vague query
    trending: {
      category: "running",
      trend_text: "Running & Sneakers trending",
      hashtags: ["#running", "#runningStyle", "#runningTrending"],
      pinterest_url: "https://www.pinterest.com/search/pins/?q=running",
    },
    
    // Current filter state
    current_filters: {
      price_max: 150,
      category: "Running",
    },
  },
};

/**
 * EXPORT FOR TESTING
 */
module.exports = {
  test1_vague_query,
  test2_specific_query,
  test3_price_comparison,
  test4_filter_state,
  trending_detection_tests,
  effective_price_tests,
  filter_extraction_tests,
  test6_full_response,
};
