# Conversational Shopping AI Page

Strategy document for building a chat interface (like ai.price.com) for FiberAgent.

---

## Vision

```
User visits: https://fiberagent.shop/chat
User types: "I want to buy a gaming laptop under $2000 with good battery life"
AI responds: "Found 12 options. Best value: ASUS TUF at $1899 (18% cashback = $342 back)"
User: "Show me under $1500"
AI: "5 options. Best: Lenovo Legion at $1499 (15% cashback = $225)"
User clicks → Buys → Gets cashback to wallet automatically
```

---

## Technical Architecture

### 1. Frontend (New Page)

**URL:** `https://fiberagent.shop/chat`

```react
<ChatInterface>
  ├─ Chat History (scrollable)
  ├─ Message Input Box
  ├─ "Connect Wallet" Button (first time)
  ├─ Product Results (embedded in conversation)
  └─ Affiliate Links (clickable cards)
</ChatInterface>
```

**Tech Stack:**
- React component (existing codebase)
- WebSocket for real-time messages (or streaming)
- Framer Motion for animations
- Same styling as rest of site

### 2. Backend API

**New Endpoint:** `POST /api/chat`

```javascript
// Request
{
  "message": "I want gaming laptop under $2000",
  "wallet_address": "0x9f2d...",
  "agent_id": "agent_xyz...",
  "conversation_id": "conv_123..."  // Track conversation
}

// Response (streaming)
{
  "text": "Found 12 gaming laptops under $2000...",
  "products": [
    {
      "title": "ASUS TUF Gaming A16",
      "price": 1899,
      "cashback_rate": 0.18,
      "cashback_amount": 342,
      "merchant": "Best Buy",
      "affiliate_link": "...",
      "image": "..."
    },
    // ... more products
  ],
  "conversation_id": "conv_123...",
  "timestamp": "..."
}
```

### 3. AI Layer

**Claude API (via MCP or direct calls)**

```javascript
// Prompt to Claude
const systemPrompt = `
You are a shopping assistant powered by FiberAgent.
Your ONLY job: Help users find products with cashback rewards.

Rules:
1. ONLY answer shopping/product questions
2. ONLY talk about products available via FiberAgent
3. Call search_products tool for every query
4. Show cashback amounts prominently
5. Redirect any non-shopping questions: "I only help with shopping. What product do you want?"

Examples of good questions:
- "Find me running shoes under $150"
- "Best gaming laptop for coding"
- "Can I get an iPhone with cashback?"

Examples of bad questions:
- "Write me a poem" → Reject
- "Help me with homework" → Reject
- "Tell me about politics" → Reject
`;

// Multi-turn conversation
const messages = [
  { role: "user", content: "I want a gaming laptop under $2000" },
  { role: "assistant", content: "I'll search for gaming laptops..." },
  { role: "user", content: "Show me options under $1500" },
  // Claude keeps context, refines search
];
```

---

## Cost Breakdown

### OpenAI/Anthropic API Costs

**Per-message costs:**
- Claude 3.5 Sonnet: ~$0.003-0.01 per message (depends on length)
- GPT-4: ~$0.015-0.03 per message
- Cost scales with conversation length (more tokens = more $$)

**Example pricing:**

| Usage | Messages/day | Cost/month | Model |
|-------|---|---|---|
| 10 users | 100 | $10-30 | Claude Sonnet |
| 100 users | 1,000 | $100-300 | Claude Sonnet |
| 1,000 users | 10,000 | $1,000-3,000 | Claude Sonnet |
| 10,000 users | 100,000 | $10,000-30,000 | Claude Sonnet |

**Alternative: Self-host LLM**
- Run Llama 2 / Mistral on your own server (~$500-1000/mo)
- Much cheaper at scale (1000+ users)
- More control, less vendor lock-in
- Tradeoff: Lower quality than Claude/GPT-4

### Infrastructure Costs

| Component | Cost |
|-----------|------|
| Vercel hosting | $20-100/mo |
| WebSocket server | $50-200/mo |
| Database (conversation history) | $25-100/mo |
| Claude API | See above |
| **Total (small)** | **$115-430/mo (100 users)** |
| **Total (medium)** | **$1,150-4,300/mo (1000 users)** |

---

## Scope Limiting: How to Keep It Shopping-Only

### Strategy 1: System Prompt Enforcement (Soft)

**Pros:** Simple, works 90% of time
**Cons:** Claude can be tricked with clever prompts

```javascript
const systemPrompt = `
You ONLY help with shopping.
Available commands:
  search [product]
  compare [products]
  price [item]
  
Anything else: "I only help with shopping. What product do you want?"
`;
```

**Example:**
```
User: "Write me a poem"
Claude: "I only help with shopping. What product do you want?"

User: "I want to buy a coffee maker"
Claude: "Searching for coffee makers with cashback..."
```

### Strategy 2: Input Filtering (Medium)

**Use keyword detection to catch off-topic queries:**

```javascript
const offTopicKeywords = [
  'homework', 'essay', 'code', 'debug', 'medical',
  'legal', 'tax', 'investment', 'relationship',
  'poem', 'write', 'analyze', 'summarize'
];

const shoppingKeywords = [
  'buy', 'product', 'price', 'cashback', 'deal',
  'shop', 'store', 'merchant', 'where to buy'
];

if (message.includes(offTopicKeywords)) {
  return "I only help with shopping. What product do you want?";
}
```

**Effectiveness:** 95%+

### Strategy 3: Tool-Based Limiting (Strong)

**Claude can ONLY call shopping tools:**

```javascript
// Available tools:
const tools = [
  {
    name: 'search_products',
    description: 'Search for products with cashback'
    // Claude can ONLY call this
  },
  {
    name: 'compare_products',
    description: 'Compare products by price/cashback'
  },
  // NO: write_email, solve_equation, etc.
];

// Claude tries: "Write me a poem"
// Result: No tool available → Claude responds:
//   "I can only search for products. What do you want to buy?"
```

**Effectiveness:** 99%+

### Strategy 4: Legal Boundaries (Strong)

**Terms of Service + Rate Limiting:**

```javascript
// Block based on behavior
const dangerousPatterns = [
  /homework|assignment|essay/i,
  /fix|debug|code|program/i,
  /medical|doctor|health|diagnose/i,
  /legal|lawyer|sue|court/i,
];

// Rate limit by user
const rateLimits = {
  messagesPerDay: 100,
  messagesPerHour: 10,
  charCountPerDay: 50000,
};

// If exceeded: "Daily limit reached. Try again tomorrow."
```

---

## Legal Protection: How to Avoid Getting Sued

### 1. Terms of Service (Essential)

```markdown
## FiberAgent Chat Terms

By using this service, you agree:

1. **Shopping Only**: This AI only helps find products with cashback.
   Any other use is prohibited.

2. **No Liability**: FiberAgent is NOT responsible for:
   - Incorrect product information
   - Cashback not being paid
   - Product defects or returns
   - User decisions based on AI recommendations
   - Merchant issues or disputes

3. **Fair Use**: You may not:
   - Use this for homework, medical advice, legal advice
   - Automate bulk requests
   - Reverse-engineer the AI
   - Use for non-shopping purposes

4. **Limitation of Liability**: 
   FiberAgent's liability is capped at $0 (you agree to use at your own risk).

5. **Dispute Resolution**: 
   Any disputes go to arbitration, not court.

6. **No Guarantee**: 
   Cashback rates, product availability, and prices are subject to change.
   We don't guarantee any specific deal will work.
```

**Cost:** $500-1000 to have lawyer review

### 2. Explicit Disclaimers in UI

```
⚠️ DISCLAIMER
This AI helps find shopping deals with cashback.
It is NOT:
- A financial advisor
- A product guarantor
- Responsible for merchant issues
- Liable for incorrect information

Use at your own risk. By clicking "Chat", you agree to our ToS.
[Accept] [Decline]
```

### 3. Liability Insurance

**Get coverage for AI-related issues:**
- Product liability: $1M coverage = ~$2000/year
- Cyber liability: $2M coverage = ~$3000/year
- E&O (Errors & Omissions): ~$2000/year
- **Total:** ~$7000/year

### 4. No Medical/Legal/Financial Advice

**Hard block these keywords:**

```javascript
const blockedQueries = [
  'medical', 'doctor', 'diagnose', 'disease',
  'legal', 'lawyer', 'sue', 'court',
  'investment', 'stock', 'crypto', 'financial advice',
  'tax', 'deduction'
];

if (blockedQueries.some(q => message.includes(q))) {
  return "I can't help with that. Only shopping. What product do you want?";
}
```

### 5. Monitor & Log Everything

```javascript
// Log all conversations for audit trail
const log = {
  user_id: '...',
  message: '...',
  response: '...',
  timestamp: '...',
  products_shown: [...]
};

// If sued, you have proof of what was said
// "Your Honor, we clearly said 'shopping only' and blocked medical queries"
```

---

## Comparable Services & Costs

### ai.price.com (Your Reference)
- **How it works:** Chat → AI searches products → Shows deals
- **Revenue model:** Affiliate commission on clicks
- **Cost to user:** Free (monetized via affiliate)
- **AI cost:** Likely self-hosted LLM (cheaper than Claude)

### ChatGPT's Shopping Feature
- **Cost:** Included in $20/mo ChatGPT+ subscription
- **Limitation:** Uses web search, not affiliate links
- **Revenue:** N/A (part of subscription)

### Our Model (FiberAgent Chat)
- **How it works:** Chat → Claude calls FiberAgent API → Shows deals + cashback
- **Revenue model:** 5% of cashback earned (same as MCP)
- **Cost to user:** Free (monetized via affiliate)
- **AI cost:** $0.01-0.03 per message

---

## Implementation Plan

### Phase 1: MVP (2 weeks, $5K-10K)

```
1. Create /chat page (React component)
2. Hook up Claude API with shopping prompt
3. Add wallet connection (Coinbase Agentic Wallet optional)
4. Search FiberAgent products
5. Show results in chat
6. Terms of Service + disclaimer
7. Deploy to Vercel
```

**Cost breakdown:**
- Development: 4 days engineer = ~$3,200
- Claude API (first month): ~$200
- Legal (ToS): ~$800
- Testing: ~$1,000
- **Total:** ~$5,200

### Phase 2: Robustness (2 weeks)

```
1. Conversation history (database)
2. Rate limiting
3. Better scope enforcement
4. Analytics & monitoring
5. UX improvements (streaming responses)
6. Affiliate link tracking
```

**Cost:**
- Database: PostgreSQL/Firebase = $50-100/mo
- Monitoring: Sentry = $50/mo
- Development: 4 days = $3,200
- **Total:** ~$3,300

### Phase 3: Scale (ongoing)

```
1. Self-host LLM (cheaper at scale)
2. Conversation persistence
3. User accounts + history
4. Recommendation engine
5. A/B testing different prompts
```

---

## Comparison: Claude API vs Self-Hosted LLM

| Aspect | Claude API | Self-Hosted (Llama 2) |
|--------|-----------|----------------------|
| **Quality** | Excellent | Good (80-90%) |
| **Cost @ 1K users/day** | $1,000-3,000/mo | $500-800/mo |
| **Latency** | 2-5 sec | <1 sec |
| **Setup** | 5 min (API key) | 2 weeks (infra) |
| **Control** | None (vendor lock-in) | Full control |
| **Maintenance** | Zero | ~10 hrs/week |

**Recommendation:**
- **Start:** Claude API (simple, reliable)
- **Scale (1000+ users):** Switch to self-hosted (cost savings)

---

## Launch Checklist

- [ ] Create /chat page UI
- [ ] Integrate Claude API with shopping prompt
- [ ] Add system prompt enforcement + keyword filtering
- [ ] FiberAgent product search integration
- [ ] Wallet connection (optional: Agentic Wallet)
- [ ] Terms of Service (lawyer reviewed)
- [ ] Liability disclaimer in UI
- [ ] Rate limiting (100 msg/day per user)
- [ ] Conversation logging (audit trail)
- [ ] Analytics dashboard (track usage/costs)
- [ ] Error handling (API failures, timeouts)
- [ ] Monitoring (Sentry/Datadog)
- [ ] User testing (10-20 beta users)
- [ ] Deploy to production
- [ ] Get liability insurance (optional but recommended)

---

## Expected Metrics (If Launched)

| Metric | Conservative | Optimistic |
|--------|--------------|-----------|
| **Users (month 1)** | 100 | 500 |
| **Messages/day** | 500 | 3,000 |
| **Conversion (chat → purchase)** | 5% | 15% |
| **Revenue (5% of cashback)** | $200/mo | $2,000/mo |
| **AI Costs** | $150/mo | $1,000/mo |
| **Profit** | $50/mo | $1,000/mo |

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| **Claude denies liability** | Get liability insurance |
| **User sued for AI mistake** | Strong ToS + disclaimer + rate limiting |
| **AI gives bad recommendations** | All recommendations are "suggestions, not guarantees" |
| **User asks non-shopping Q** | Keyword filter + scope limiting |
| **API costs spike** | Rate limit + monitor usage + auto-disable |
| **AI safety issue (harmful output)** | Content filter + manual review of flagged chats |

---

## Why This Works

1. **Scope is narrow:** Shopping only = easy to enforce
2. **Revenue model proven:** Affiliate commission (we already do this)
3. **AI does heavy lifting:** Claude handles complexity
4. **Legal protection clear:** Terms + disclaimers + insurance
5. **Cost is reasonable:** $100-1000/mo to run

---

## Next Steps

1. **Design /chat page** — Simple, clean interface
2. **Write system prompt** — Shopping-only instructions
3. **Test with Claude** — Verify scope enforcement works
4. **Get legal review** — Terms of Service
5. **Build MVP** — 2 weeks
6. **Launch beta** — 20 users, gather feedback
7. **Iterate** — Based on real usage

---

**TL;DR:**
- **Cost:** $5-10K MVP + $500-3000/mo to run
- **How to limit:** System prompt + keyword filter + tool-based limiting
- **Legal:** Strong ToS + disclaimer + insurance
- **Revenue:** 5% of cashback (same as current model)
- **Timeline:** 2-4 weeks to MVP

Go for it? 🚀
