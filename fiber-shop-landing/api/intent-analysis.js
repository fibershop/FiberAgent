/**
 * Intent Analysis - Use Claude to determine what to do with user request
 * 
 * Analyzes user message to determine:
 * - Should we offer Pinterest trends suggestions?
 * - What are the key search terms?
 * - Do we need more details from the user?
 * - What context is missing?
 */

const Anthropic = require('@anthropic-ai/sdk');

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn('[INTENT] ANTHROPIC_API_KEY not set, intent analysis will fall back');
}

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Analyze user intent using Claude
 */
async function analyzeIntent(userMessage, conversationHistory = []) {
  // Fallback if API key not configured
  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      shouldOfferTrends: false,
      keywordToSearch: userMessage,
      needsMoreDetails: false,
      missingContext: null,
      reasoning: 'API key not configured, using fallback analysis',
    };
  }

  try {
    const systemPrompt = `You are an intelligent shopping assistant that understands user intent.

Your job is to analyze user messages and determine:
1. Should we offer trending suggestions (Pinterest style)?
2. What are the key search terms to use with Fiber?
3. Do we need more details from the user?
4. What context is missing?

Return a JSON object with:
{
  "shouldOfferTrends": boolean,
  "keywordToSearch": string or null,
  "needsMoreDetails": boolean,
  "missingContext": string or null,
  "reasoning": string
}

Guidelines:
- If user says "I'm looking for shoes" (vague category), offer trends
- If user says "Nike Air Max red size 10", search directly with keyword
- If user mentions budget, style, or brand specifics, search directly
- Only ask for more details if critical info is missing (e.g., size for clothes, type for electronics)
- keywordToSearch should be short and optimized for product search (2-5 words max)

Examples:
- "shoes" → { shouldOfferTrends: true, keywordToSearch: null }
- "I'm looking for shoes" → { shouldOfferTrends: true, keywordToSearch: null }
- "Nike shoes" → { shouldOfferTrends: false, keywordToSearch: "Nike shoes" }
- "blue running shoes for men" → { shouldOfferTrends: false, keywordToSearch: "blue running shoes men" }
- "laptop under $500" → { shouldOfferTrends: false, keywordToSearch: "laptop under 500" }`;

    // Build conversation for Claude
    const messages = [
      ...conversationHistory,
      {
        role: 'user',
        content: userMessage,
      },
    ];

    const response = await client.messages.create({
      model: 'claude-opus-4-1-20250805',
      max_tokens: 500,
      system: systemPrompt,
      messages,
    });

    const content = response.content[0].text;
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[INTENT] Could not extract JSON:', content);
      // Fallback to direct search
      return {
        shouldOfferTrends: false,
        keywordToSearch: userMessage,
        needsMoreDetails: false,
        missingContext: null,
        reasoning: 'Fallback: Could not parse Claude response',
      };
    }

    const result = JSON.parse(jsonMatch[0]);
    console.log('[INTENT] Analysis:', result);
    return result;
  } catch (err) {
    console.error('[INTENT] Error:', err.message);
    // Fallback to direct search
    return {
      shouldOfferTrends: false,
      keywordToSearch: userMessage,
      needsMoreDetails: false,
      missingContext: null,
      reasoning: `Error analyzing intent: ${err.message}`,
    };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message = '', conversationHistory = [] } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'message required' });
  }

  try {
    const analysis = await analyzeIntent(message, conversationHistory);
    
    return res.status(200).json({
      success: true,
      ...analysis,
    });
  } catch (err) {
    console.error('[INTENT] Handler error:', err.message);
    return res.status(200).json({
      success: false,
      error: err.message,
      shouldOfferTrends: false,
      keywordToSearch: message,
    });
  }
}
