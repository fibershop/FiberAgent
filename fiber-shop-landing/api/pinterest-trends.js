/**
 * Pinterest Trends API
 * Get trending products for a category to guide user discovery
 */

const PINTEREST_SEARCH = 'https://api.pinterest.com/v1/pins/search';

// Generic category keywords that need Pinterest guidance
const GENERIC_KEYWORDS = [
  'shoes', 'boots', 'jacket', 'coat', 'shirt', 'pants', 'dress',
  'hat', 'sweater', 'socks', 'gloves', 'backpack', 'bag', 'wallet',
  'watch', 'belt', 'scarf', 'jeans', 'shorts', 'hoodie', 'vest',
  'sunglasses', 'glasses', 'hat', 'cap', 'beanie', 'suit', 'blazer'
];

const INDECISIVE_PHRASES = [
  "don't know", "not sure", "no idea", "help me choose", "what should i",
  "recommend", "suggestions", "ideas", "what's trending", "popular",
  "best seller", "top rated", "what do you suggest"
];

/**
 * Check if query is generic or indecisive
 */
function shouldOfferSuggestions(query) {
  const lower = query.toLowerCase().trim();
  
  // Check for explicit indecision
  if (INDECISIVE_PHRASES.some(phrase => lower.includes(phrase))) {
    return true;
  }
  
  // Check for generic single-word product categories
  if (GENERIC_KEYWORDS.some(keyword => lower === keyword)) {
    return true;
  }
  
  // Check if query is very short and generic (e.g., "shoes", "boots")
  if (lower.length < 15 && GENERIC_KEYWORDS.some(keyword => lower.includes(keyword))) {
    // But if they add specifics, don't offer suggestions
    // E.g., "nike shoes" → no suggestions (they know what they want)
    const wordCount = lower.split(/\s+/).length;
    return wordCount === 1; // Only single-word generic queries
  }
  
  return false;
}

/**
 * Get Pinterest trending products for a category
 * Returns mock trending items since Pinterest API requires auth
 */
function getTrendingForCategory(category) {
  // Mock Pinterest trends data
  const trendingByCategory = {
    'shoes': [
      { title: 'Running Shoes', image: '👟', description: 'Latest athletic shoes' },
      { title: 'Hiking Boots', image: '🥾', description: 'Trail-ready footwear' },
      { title: 'Casual Sneakers', image: '👟', description: 'Everyday comfort' },
      { title: 'Formal Dress Shoes', image: '👞', description: 'Professional style' },
    ],
    'boots': [
      { title: 'Winter Boots', image: '🥾', description: 'Cold weather protection' },
      { title: 'Hiking Boots', image: '⛰️', description: 'Adventure-ready' },
      { title: 'Combat Boots', image: '👢', description: 'Edgy style' },
      { title: 'Cowboy Boots', image: '🤠', description: 'Western classic' },
    ],
    'jacket': [
      { title: 'Winter Jacket', image: '🧥', description: 'Warm & cozy' },
      { title: 'Leather Jacket', image: '🧥', description: 'Timeless style' },
      { title: 'Rain Jacket', image: '☔', description: 'Weather protection' },
      { title: 'Denim Jacket', image: '👖', description: 'Casual classic' },
    ],
    'backpack': [
      { title: 'Travel Backpack', image: '🎒', description: 'Adventure-ready' },
      { title: 'School Backpack', image: '🎒', description: 'Spacious & durable' },
      { title: 'Hiking Backpack', image: '🥾', description: 'Off-trail gear' },
      { title: 'Laptop Backpack', image: '💼', description: 'Professional carry' },
    ],
    'watch': [
      { title: 'Sports Watch', image: '⌚', description: 'Performance tracking' },
      { title: 'Dress Watch', image: '⌚', description: 'Elegant timepiece' },
      { title: 'Smart Watch', image: '⌚', description: 'Tech-enabled' },
      { title: 'Casual Watch', image: '⌚', description: 'Everyday style' },
    ],
    'sunglasses': [
      { title: 'Aviator Sunglasses', image: '😎', description: 'Classic style' },
      { title: 'Wayfarer Sunglasses', image: '😎', description: 'Iconic design' },
      { title: 'Sports Sunglasses', image: '😎', description: 'UV protection' },
      { title: 'Oversized Sunglasses', image: '😎', description: 'Trendy vibes' },
    ],
  };
  
  const categoryKey = category.toLowerCase().trim();
  return trendingByCategory[categoryKey] || 
    trendingByCategory[Object.keys(trendingByCategory)[0]] ||
    [];
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message = '' } = req.body;

  try {
    // Check if we should offer suggestions
    if (!shouldOfferSuggestions(message)) {
      return res.status(200).json({
        shouldOfferSuggestions: false,
        suggestions: null,
      });
    }

    // Extract category (first meaningful word)
    const category = message.toLowerCase()
      .split(/\s+/)
      .find(word => GENERIC_KEYWORDS.includes(word)) || 'shoes';

    const trending = getTrendingForCategory(category);

    return res.status(200).json({
      shouldOfferSuggestions: true,
      category,
      suggestions: trending.slice(0, 4),
      promptText: `Great! Here are some trending ${category} options. Pick one to see specific deals:`,
    });
  } catch (err) {
    console.error('[PINTEREST] Error:', err.message);
    return res.status(200).json({
      shouldOfferSuggestions: false,
      error: err.message,
    });
  }
}
