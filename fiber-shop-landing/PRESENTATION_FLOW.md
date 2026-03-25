# FiberAgent: Complete Data Flow & Architecture

## Executive Overview

FiberAgent uses a **2-stage intelligent pipeline** to understand user intent and deliver personalized shopping results:

1. **Stage 1: Intent Analysis** — Claude determines what user wants (vague → suggestions, specific → search)
2. **Stage 2: Smart Filtering** — Claude ranks 100 products based on user context and relevance

**Key Innovation:** Uses conversation history (not databases) to learn user preferences over time.

---

## Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USER (Chat Window)                         │
│                    "I'm looking for running shoes"                   │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│          STAGE 1: INTENT ANALYSIS (ChatPage.js)                     │
│                                                                       │
│  Input: User message + conversation history (session memory)         │
│  Process: /api/intent-analysis (Claude Haiku)                        │
│                                                                       │
│  Claude analyzes:                                                     │
│  • Is query vague ("shoes") or specific ("Nike Air Max")?           │
│  • What are optimized search keywords?                               │
│  • Do we need more details from user?                                │
│                                                                       │
│  Output: {                                                            │
│    shouldOfferTrends: boolean,                                        │
│    keywordToSearch: string,                                           │
│    needsMoreDetails: boolean,                                         │
│    reasoning: string                                                  │
│  }                                                                    │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         ├─ If vague (shouldOfferTrends = true)
                         │  └─> Show Pinterest-style trending suggestions
                         │
                         └─ If specific (keywordToSearch provided)
                            │
                            ▼
        ┌──────────────────────────────────────────────────┐
        │       STAGE 2: FIBER API SEARCH                  │
        │                                                   │
        │ /api/chat calls Fiber API:                        │
        │ GET /v1/agent/search                              │
        │   ?keywords=Nike+running+shoes                    │
        │   &agent_id=...                                   │
        │   &limit=100  (← Increased from 10)               │
        │                                                   │
        │ Response: 100 products with:                      │
        │ • title, price, image_url                         │
        │ • merchant_name, rating, reviews                  │
        │ • cashback_rate, cashback_amount                  │
        │ • affiliate_link                                  │
        └──────────────────┬──────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────────────────┐
        │    STAGE 3: CLAUDE FILTERING & RANKING           │
        │                                                   │
        │ /api/filter-results (Claude Haiku)               │
        │                                                   │
        │ Input: All 100 products + user message +          │
        │        conversation history                       │
        │                                                   │
        │ Claude ranks by:                                  │
        │ 1. Relevance to user request                      │
        │ 2. Price + cashback value (combined)              │
        │ 3. Quality (ratings, reviews)                     │
        │ 4. User demographics (if mentioned):              │
        │    - Gender hints ("men's", "women's")           │
        │    - Budget ("under $100")                        │
        │    - Brand preferences ("Nike", "Adidas")         │
        │    - Use case ("running", "casual")               │
        │                                                   │
        │ Output: Top 8-10 products with:                   │
        │ {                                                 │
        │   rank: 1-10,                                     │
        │   score: 0-100,                                   │
        │   reason: "Why this is best match"                │
        │ }                                                 │
        └──────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│              DISPLAY: Top 6 Results to User                          │
│                                                                       │
│  Each product card shows:                                            │
│  • Product image + title                                             │
│  • Price, merchant, rating                                           │
│  • Cashback % + $ amount                                             │
│  • "Buy now" link (tracks agent via affiliate_link)                  │
│  • Filter reason (why Claude ranked it)                              │
└─────────────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│            CONTEXT PRESERVATION (Session Memory)                    │
│                                                                       │
│  Conversation history is stored in React state:                     │
│  [                                                                    │
│    { id: 1, type: 'user', text: "I'm looking for shoes" },          │
│    { id: 2, type: 'assistant', text: "...", products: [...] },      │
│    { id: 3, type: 'user', text: "Show me blue ones" },              │
│    ...                                                               │
│  ]                                                                    │
│                                                                       │
│  This history is passed to Claude on EVERY request:                  │
│  • Intent analysis "understands" previous questions                  │
│  • Filtering "remembers" user's style preferences                    │
│  • Claude can reference: "You looked at Nike last time..."           │
│                                                                       │
│  Session scope: Lost on page refresh (stateless design)              │
│  User scope: NOT persisted to database (privacy-first)               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## How Context is Used (Examples)

### Example 1: Iterative Refinement
```
Message 1: User: "I'm looking for shoes"
  → Intent: Vague, offer trends

Message 2: User: "Actually, Nike running shoes for men"
  → Intent: Specific (context: refined from general)
  → Filter keywords: gender="men", brand="Nike", category="running"
  → Claude remembers: User wants Nike, filtering out women's shoes

Message 3: User: "Show me blue ones"
  → Intent: Filter refinement (context: already searching Nike running shoes)
  → Filter keywords: color hint from message 1-3 history
  → Claude remembers: Previous results, narrows to blue options
```

### Example 2: Budget-Aware Filtering
```
Message 1: User: "Laptop under $1000"
  → Intent: Specific + budget constraint
  → Filter: Exclude products >$1000
  
Message 2: User: "What about gaming ones?"
  → Intent: Refine category (context: still under $1000 from msg 1)
  → Filter: Gaming laptops, sorted by performance/price, exclude expensive
```

### Example 3: Brand Loyalty
```
Message 1: User: "Adidas shoes"
  → Claude filters: Prioritize Adidas options
  
Message 2: User: "What else is good?"
  → Context: User showed interest in Adidas
  → Claude filters: Similar brands (Nike, New Balance) with good ratings
```

---

## Data Sources & Privacy

### Where Data Comes From

| Data Source | Type | Used For | Updated |
|-------------|------|----------|---------|
| **Fiber API** | 50K+ merchants, real products | Search results | Real-time |
| **Cashback rates** | Per-merchant rates | Filtering by value | Real-time |
| **User conversation** | Messages in chat | Context for intent/filtering | Per-message |
| **Product ratings** | 3rd party (Fiber provides) | Quality ranking | Real-time |

### What We DON'T Store

❌ **User personal data** — No names, emails, locations stored  
❌ **Wallet addresses** — Only held in session memory (lost on refresh)  
❌ **Search history** — Not persisted to database  
❌ **Preferences profile** — Inferred only from current conversation  
❌ **Behavioral data** — No tracking across sessions  

### Privacy Model

```
┌────────────────────────┐
│   User Conversation    │  Session memory only
│   (Chat History)       │  ↓ Lost on page refresh
│   ↓                    │  ↓ Never sent to database
│   Claude (intent)      │
│   ↓                    │
│   Claude (filtering)   │  All Claude calls:
│   ↓                    │  • System prompt only
│   Results → User       │  • No persistent logs
│                        │  • No learning across users
└────────────────────────┘
```

**Bottom line:** Privacy by architecture. We can't spy on users because we don't store their data.

---

## Technical Implementation

### Stage 1: Intent Analysis

**Endpoint:** `POST /api/intent-analysis`

```javascript
// Request
{
  message: "I'm looking for running shoes",
  conversationHistory: [
    { role: "user", content: "Hi" },
    { role: "assistant", content: "Hi! What can I help with?" }
  ]
}

// Response
{
  success: true,
  shouldOfferTrends: false,           // Query is specific, not vague
  keywordToSearch: "running shoes",   // Optimized for Fiber API
  needsMoreDetails: false,
  missingContext: null,
  reasoning: "User specified both category (shoes) and use case (running)"
}
```

**Claude's task:** Classify user intent from natural language
- ✅ Handles typos: "sheos" → "shoes"
- ✅ Extracts specs: "blue Nike size 10" → keywords optimized
- ✅ Detects vagueness: "just browsing" → offer suggestions
- ✅ Remembers context: "Show me more like the first one" → ref previous results

---

### Stage 2: Smart Filtering

**Endpoint:** `POST /api/filter-results`

```javascript
// Request
{
  message: "I'm looking for running shoes",
  products: [
    // 100 products from Fiber, each with:
    { 
      id: "123",
      title: "Nike Air Max 90",
      price: 139.99,
      cashback_rate: 0.05,
      rating: 4.8,
      reviews_count: 2341,
      merchant: "Nike"
    },
    // ... 99 more
  ],
  conversationHistory: [...]
}

// Response
{
  success: true,
  filteredProducts: [
    {
      id: "123",
      rank: 1,
      score: 95,
      reason: "Highly rated running shoe, Nike brand, 5% cashback"
    },
    {
      id: "456",
      rank: 2,
      score: 89,
      reason: "Best value for running, Adidas, 6% cashback"
    },
    // ... top 8-10
  ],
  reasoning: "Ranked by relevance (running), quality (ratings), and value (cashback)"
}
```

**Claude's task:** Rank 100 products → top 10
- ✅ Ignores irrelevant products (tennis shoes for a "running" query)
- ✅ Balances price + value (sometimes cashback wins, sometimes cheaper is better)
- ✅ Considers ratings (4.8 stars → boost, 2.1 stars → demote)
- ✅ Learns from context (if user liked Nike before, boost Nike options)

---

## Session Flow in ChatPage.js

```javascript
// Step 1: User types "I'm looking for running shoes"
const userMessage = "I'm looking for running shoes";

// Step 2: Build conversation history for Claude
const conversationHistory = messages.map(m => ({
  role: m.type === 'assistant' ? 'assistant' : 'user',
  content: m.text
}));

// Step 3: Call intent analysis
const intentRes = await fetch('/api/intent-analysis', {
  body: JSON.stringify({ message: userMessage, conversationHistory })
});
const intentData = await intentRes.json();
// → { shouldOfferTrends: false, keywordToSearch: "running shoes" }

// Step 4: If specific, search Fiber (100 products)
const chatRes = await fetch('/api/chat', {
  body: JSON.stringify({ 
    message: intentData.keywordToSearch,
    conversationHistory 
  })
});
const allProducts = await chatRes.json();
// → 100 products from Fiber API

// Step 5: Call filtering to rank products
const filterRes = await fetch('/api/filter-results', {
  body: JSON.stringify({ 
    message: userMessage,
    products: allProducts,
    conversationHistory 
  })
});
const filtered = await filterRes.json();
// → Top 8-10 ranked products

// Step 6: Display top 6 to user
setMessages([...messages, {
  type: 'assistant',
  products: filtered.slice(0, 6)  // ← Only show 6
}]);

// Step 7: User sends next message
// → Conversation history grows, Claude learns more context
```

---

## Cost Optimization

### Model Choice

| Use Case | Model | Cost/1K tokens | Reasoning |
|----------|-------|----------------|-----------|
| Intent Analysis | Haiku | $0.80 | Fast classification, doesn't need reasoning |
| Filtering | Haiku | $0.80 | Ranking doesn't require complex logic |
| Context Learning | Session Memory | $0 | Conversation stored in React, not API |

**Result:** ~$0.005 cost per user search (intent + filtering)

### Volume Projections

```
Assumptions:
- 1000 users/day
- Average 3 searches/user = 3000 searches/day
- Each search: intent ($0.002) + filtering ($0.003) = $0.005

Daily cost:  3000 × $0.005 = $15/day
Monthly cost: 3000 × 30 × $0.005 = $450/month
Annual cost: $5,400

At scale (100K users/day):
Annual cost: $540,000 for Claude calls
(Still cheaper than ML training, database infrastructure, engineering)
```

---

## What Makes This Different

### Traditional E-commerce
```
User → Search bar → Keyword match → Static ranking (price/rating)
Problem: Generic results, no understanding of intent
```

### FiberAgent (Claude-Powered)
```
User → Natural language → Intent analysis → 100 products
         ↓
         Conversation history (learns user style)
         ↓
         Claude filtering (personalized ranking)
         ↓
         Top 6 results (tailored to user)
```

**Advantages:**
- ✅ Understands "I'm looking for" vs "Nike shoes"
- ✅ Learns from conversation (blue shoes → offer blue options next)
- ✅ Balances price + cashback intelligently
- ✅ No user profiling database needed (privacy-first)
- ✅ Works with any language (Claude handles nuance)
- ✅ Scalable (stateless, serverless architecture)

---

## Scaling to Multiple Agents

### Single Agent (Claude Desktop/MCP)
```
Claude → FiberAgent → /api/intent-analysis
                    → /api/chat (Fiber)
                    → /api/filter-results
                    → Display results
```

### Multiple Agents (Agent Network)
```
Agent 1 (Shopping AI)  → FiberAgent
Agent 2 (Lifestyle AI) → ↓
Agent 3 (Gaming AI)    → Shared intent + filtering endpoints
...
Agent N               → Load-balanced across Vercel functions
```

**Architecture benefit:** One intent/filtering pipeline serves unlimited agents. No duplication, shared logic.

---

## Security & Compliance

### Data Flow Security

```
User Input
  ↓
[Sanitized in ChatPage]
  ↓
HTTPS to Vercel
  ↓
[Rate limited]
  ↓
Claude API (encrypted connection)
  ↓
Fiber API (encrypted connection)
  ↓
Response back to user
  ↓
[Displayed in React, no storage]
```

### No PII Exposure
- Claude never sees wallet addresses (only agent_id)
- Fiber API called with agent_id, not user identity
- Conversation context is session-only (not logged)
- No cookies, no tracking pixels, no analytics

---

## Future Improvements (Roadmap)

### Phase 2 (May 2026)
- [ ] **Persistent user preferences** — Optional: user profile (opt-in)
- [ ] **Multi-modal filtering** — Images: "Find shoes like this photo"
- [ ] **A/B testing** — Compare intent analysis models
- [ ] **Analytics** — Aggregated metrics (no PII)

### Phase 3 (Jun 2026)
- [ ] **Fine-tuned intent model** — Task-specific small model (even cheaper)
- [ ] **Batch searching** — "Find shoes AND jackets" in one call
- [ ] **Cross-agent collaboration** — Agent A calls Agent B for refinement
- [ ] **Agent reputation** — ERC-8004 scoring based on recommendations quality

---

## Questions & Answers

### Q: How do you prevent Claude from hallucinating product data?
**A:** Claude doesn't generate products—it only filters/ranks real Fiber data. The source of truth is Fiber API's 100-product response. Claude's job is selection, not creation.

### Q: What if Claude's filtering is wrong?
**A:** Graceful fallback: If Claude analysis fails, show top 10 by price (cheapest after cashback). Claude is a feature, not a requirement.

### Q: How much conversation history do you keep?
**A:** Only the current session (browser memory). On page refresh, history is lost. This is intentional for privacy and stateless architecture.

### Q: Can users opt-out of Claude filtering?
**A:** Yes—there's always a fallback to price-based ranking. Future: explicit toggle in settings.

### Q: How does this work for agents without conversation context?
**A:** First message has no context, so intent analysis is basic (keyword extraction). Context builds with each message. Second search is smarter than first.

---

## Conclusion

FiberAgent's 2-stage Claude pipeline:
1. **Understands intent** (not just keywords)
2. **Personalizes results** (learns from conversation)
3. **Respects privacy** (no database storage)
4. **Scales cheaply** (Haiku model, $0.005/search)
5. **Works across agents** (shared infrastructure)

This is the bridge between natural language and product discovery—powered by AI, not databases.
