/**
 * Fiber Trends API Integration
 * Get trending products for a category to guide user discovery
 */

const FIBER_API = 'https://api.fiber.shop/v1';

// Generic category keywords that need trends guidance
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
 * Get trending products from Fiber API
 */
async function getTrendingForCategory(interest) {
  try {
    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), 5000);
    
    // Call Fiber's trends endpoint
    const url = `${FIBER_API}/agent/trends?interest=${encodeURIComponent(interest)}&region=US`;
    
    console.log(`[TRENDS] Fetching: ${url}`);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutHandle);
    
    if (!res.ok) {
      console.log(`[TRENDS] Error: ${res.status}`);
      return null;
    }
    
    const data = await res.json();
    console.log(`[TRENDS] Got response with ${data.trends?.length || 0} trends`);
    
    // Transform Fiber trends into suggestion cards
    const suggestions = (data.trends || []).slice(0, 4).map((trend, idx) => ({
      title: trend.title || trend.name,
      description: trend.description || `Trending in ${interest}`,
      image: trend.emoji || '🛍️',
    }));
    
    return suggestions.length > 0 ? suggestions : null;
  } catch (err) {
    console.error('[TRENDS] Error:', err.message);
    return null;
  }
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

    // Extract interest (first meaningful word)
    const interest = message.toLowerCase()
      .split(/\s+/)
      .find(word => GENERIC_KEYWORDS.includes(word)) || 'shoes';

    // Fetch trending from Fiber API
    const suggestions = await getTrendingForCategory(interest);

    if (!suggestions) {
      return res.status(200).json({
        shouldOfferSuggestions: false,
        error: 'Could not fetch trends',
      });
    }

    return res.status(200).json({
      shouldOfferSuggestions: true,
      interest,
      suggestions,
      promptText: `Great! Here are some trending ${interest} options. Pick one to see specific deals:`,
    });
  } catch (err) {
    console.error('[TRENDS] Error:', err.message);
    return res.status(200).json({
      shouldOfferSuggestions: false,
      error: err.message,
    });
  }
}
