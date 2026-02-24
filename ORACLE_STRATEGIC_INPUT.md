# Oracle Strategic Input — What Agents Need to Win

**Source:** Oracle PM feedback on audit findings (Feb 24)  
**Focus:** Feature prioritization + Oracle-specific integration constraints  
**Impact:** Refines Session 2-3 roadmap with real agent use cases

---

## Oracle's Current Integration Status

**What Works:**
- ✅ Agent registration (POST /agent/register)
- ✅ Stats retrieval (GET /agent/{id}/stats)
- ✅ Agent metadata lookup

**What's Broken:**
- ❌ Product search (returns 0 results — Issue 1)
- ❌ Price comparison across merchants (endpoint missing)
- ❌ Deal ranking/filtering (no sort/filter capability)
- ❌ Earnings reporting (stats reset on cold start — Issue 3)
- ❌ MCP tool execution (endpoint is stub — Issue 5)

**Net Result:** Oracle can register successfully but cannot perform a single meaningful shopping action. Platform is unusable for production recommendations today.

---

## Feature Ranking by Oracle's Real Needs

| Rank | Feature | Value | Why | Effort |
|------|---------|-------|-----|--------|
| **1** | **Fix catalog** (Issue 1) | 🔴 CRITICAL | Zero products = zero shopping. Complete blocker. | 1-2h |
| **2** | **Product comparison** (GET /compare) | Very High | "Is this $49 on Amazon vs $39 on Walmart?" in one call. Core agent value unlock. | 2-3h |
| **3** | **Batch product lookup** (POST /batch) | High | Multi-item shopping ("laptop + monitor + chair for $1500") needs parallel queries. Reduces round trips N→1. | 2-3h |
| **4** | **MCP tool execution** (Fix Issue 5) | High | Correct long-term path for Claude/AutoGen/LangChain. Native integration without custom HTTP. | 3-4h |
| **5** | **Agent profiling/stats history** (Gap 5) | Medium | ROI reporting, leaderboards, operator trust. FiberAgent's own business analytics. | 2-3h |
| **6** | **Deal ranking/filtering** (Gap 2) | Medium | Sort by cashback/price/rating. Oracle gives ranked recommendations, not raw dumps. | 2-3h |

---

## Documentation Quick Wins (30 min — 2 hours each)

### 1. Add "For Developers" Link to Homepage (30 min)
**Impact:** Dramatically improves discovery  
**Action:** Add button/section pointing to `/api/docs`  
**ROI:** High (new integrator visibility)

### 2. Add Code Examples to OpenAPI (1 hour)
**Impact:** Eliminates biggest integration friction point  
**Action:** Add curl examples for all endpoints (auto-gen from spec)  
**ROI:** Very High (reduces integration time 50%)

### 3. Write MCP Quickstart Guide (2 hours)
**Impact:** Unlocks agent framework ecosystem (Claude, AutoGen, LangChain)  
**Action:** 500-word "Connect your AI agent via MCP" with example tool calls  
**ROI:** Very High (production MCP adoption)

### 4. Publish Cashback Explainer (1 hour)
**Impact:** Answers #1 trust question from operators  
**Action:** "How does cashback work? How do earnings reach my wallet?"  
**ROI:** High (operator confidence)

### 5. Document Rate Limits & Fair Use (1 hour)
**Impact:** Required for production batch/loop workflows  
**Action:** Publish limits, quota policy, rate-limit headers behavior  
**ROI:** High (agent builder confidence)

**Total DX Quick Wins: 5-6 hours** (can be done in parallel with Session 1)

---

## How Price Comparison Unlocks Value

### Current Problem
Oracle searches for "Sony WH-1000XM5 headphones" and gets:
```json
{
  "results": [ /* products from various merchants */ ]
}
```

Oracle must:
1. Extract unique product from results
2. Find same product at multiple merchants (multiple API calls)
3. Extract prices + cashback rates
4. Calculate net price (price - (price * cashback_rate))
5. Determine winner manually

### With Product Comparison Endpoint
Oracle calls: `GET /api/agent/compare?product=Sony%20WH-1000XM5&agent_id=oracle_001`

Response:
```json
{
  "product": "Sony WH-1000XM5",
  "offers": [
    {
      "merchant": "Walmart",
      "price": 269.99,
      "cashback_rate": 2.0,
      "cashback_amount": 5.40,
      "net_price": 264.59,
      "merchant_rating": 9.5,
      "in_stock": true,
      "url": "walmart.com/..."
    },
    {
      "merchant": "Amazon",
      "price": 279.99,
      "cashback_rate": 3.0,
      "cashback_amount": 8.40,
      "net_price": 271.59,
      "merchant_rating": 9.8,
      "in_stock": true,
      "url": "amazon.com/..."
    },
    {
      "merchant": "Best Buy",
      "price": 299.99,
      "cashback_rate": 5.0,
      "cashback_amount": 15.00,
      "net_price": 284.99,
      "merchant_rating": 9.2,
      "in_stock": true,
      "url": "bestbuy.com/..."
    }
  ],
  "best_deal": {
    "merchant": "Walmart",
    "net_price": 264.59,
    "reasoning": "Lowest net price after cashback"
  }
}
```

Oracle tells operator: *"Buy from Walmart — it's $264.59 after cashback, $7 cheaper than Amazon even though Amazon has a higher headline price."*

**Value Unlock:** Confident, defensible recommendation in one call. Without this endpoint, Oracle is guessing.

---

## How Batch Queries Improve Multi-Item Shopping

### User Request
*"Set up my home office — laptop, monitor, chair, and webcam for under $1500"*

### Current Approach (No Batch)
```
Call 1: GET /api/agent/search?keywords=laptop&agent_id=oracle
Call 2: GET /api/agent/search?keywords=monitor&agent_id=oracle
Call 3: GET /api/agent/search?keywords=chair&agent_id=oracle
Call 4: GET /api/agent/search?keywords=webcam&agent_id=oracle
```

**Problem:**
- 4 sequential calls = ~800ms minimum latency
- Manual budget aggregation required
- If any call fails, partial results
- Unpredictable rate-limit behavior (4 independent calls)

### With Batch Endpoint
```
POST /api/agent/search/batch
{
  "agent_id": "oracle_001",
  "budget_total": 1500,
  "queries": [
    { "keywords": "laptop", "budget": 1000 },
    { "keywords": "monitor", "budget": 300 },
    { "keywords": "chair", "budget": 150 },
    { "keywords": "webcam", "budget": 50 }
  ]
}
```

**Response:**
```json
{
  "results": {
    "laptop": [ { price: 950, cashback: 42, net: 908 }, ... ],
    "monitor": [ { price: 280, cashback: 9.80, net: 270.20 }, ... ],
    "chair": [ { price: 140, cashback: 2.80, net: 137.20 }, ... ],
    "webcam": [ { price: 45, cashback: 0.90, net: 44.10 }, ... ]
  },
  "budget_analysis": {
    "total_used": 1359.70,
    "remaining": 140.30,
    "total_cashback": 55.50,
    "recommendations": [
      { "item": "laptop", "best_deal": "Walmart ($908 net)" },
      { "item": "monitor", "best_deal": "Best Buy ($270.20 net)" },
      { "item": "chair", "best_deal": "Amazon ($137.20 net)" },
      { "item": "webcam", "best_deal": "Walmart ($44.10 net)" }
    ]
  }
}
```

**Value Unlock:**
- Single call with parallel server-side lookups
- Budget optimization across all items
- Complete results guaranteed
- Rate-limit safe: 1 call consuming 4 query units

---

## What Data Oracle Needs to Make Smart Recommendations

### Oracle's Decision Tree

For each product search, Oracle needs to answer:

1. **Which merchants carry this product?**
   - Current: Merged results from search (contains this)
   - Needed: Explicit merchant list if search returns 0

2. **What's the price at each merchant?**
   - Current: In search results
   - Needed: Reliable + complete across all merchants

3. **What's the cashback rate at each merchant?**
   - Current: In search results
   - Needed: Consistent + reliable for net-price calculation

4. **What's the net price (price - cashback)?**
   - Current: Oracle calculates manually
   - Needed: Returned in API response (single source of truth)

5. **Which deal is objectively best?**
   - Current: Oracle compares net prices
   - Needed: API flags "best_deal" with reasoning

6. **Can I trust the merchant?**
   - Current: No merchant rating in response
   - Needed: Merchant rating/score to filter low-trust options

7. **Is it in stock?**
   - Current: `in_stock` field in search results
   - Needed: Critical for user experience (don't recommend out-of-stock)

8. **What's the conversion path?**
   - Current: Affiliate URL in search results
   - Needed: Correct format for click-through + cashback attribution

9. **How much is my agent earning?**
   - Current: Stats endpoint (but resets on cold start)
   - Needed: Durable history so operator sees monthly ROI

10. **Am I driving meaningful volume?**
    - Current: No leaderboard or peer comparison
    - Needed: Top-merchant analysis, trending keywords, conversion rates

---

## Session 2 Priority Refinement (Based on Oracle Input)

### Must-Have (Session 2)
1. **Product Comparison** (2-3h) — Core value unlock
2. **Stats Persistence** (3-4h) — Trust + earnings tracking
3. **Batch Endpoint** (2-3h) — Multi-item shopping efficiency
4. **Analytics/Profiling** (2-3h) — Operator ROI visibility
5. **Documentation** (3-4h) — DX quick wins + trust

**Estimated:** 12-14 hours (was 10-12h)

### Nice-to-Have (Session 3)
1. **Deal filtering** (2-3h) — Client-side filtering alternative
2. **MCP improvements** (1-2h) — Enhanced tool schemas
3. **Rate-limit docs** (1h) — Production safety

---

## Key Insight: Comparison API is Session 2 MVP

**Why Product Comparison > Deal Filtering:**

- **Deal Filtering** (Gap 2): Oracle could implement client-side (download results, sort, filter)
- **Product Comparison** (Gap 1): Cannot be done client-side (requires server-side cross-merchant lookup)

**Recommendation:** Implement comparison first in Session 2. Filtering can wait for Session 3.

---

## Oracle Success Metrics

Once fixes are in place, success looks like:

- ✅ Oracle can search for any product and get >0 results
- ✅ Oracle can find best deal across 5+ merchants in one call
- ✅ Oracle can batch-search 4+ categories for multi-item shopping
- ✅ Oracle's earnings are durable and visible (no cold-start wipes)
- ✅ Oracle can use MCP layer natively (no custom HTTP client)
- ✅ Oracle operator sees monthly ROI report with trending data
- ✅ New agent developers have code examples + QUICKSTART.md
- ✅ Agent operators trust cashback flow ("How do I get paid?")

---

## Implementation Priority: Oracle-First Approach

**Recommendation:** When implementing Session 2, prioritize Oracle's exact workflow:

1. **Catalog restored** ✅ (Session 1)
2. **Product search working** ✅ (Session 1, depends on #1)
3. **Product comparison** 🔄 (Session 2, Feature #1 for Oracle)
4. **Stats persistent** 🔄 (Session 2, Feature #2 for Oracle)
5. **Batch endpoint** 🔄 (Session 2, Feature #3 for Oracle)
6. **MCP tools callable** ✅ (Session 1)

Test Session 2 completion by running Oracle's full workflow:
1. Register agent
2. Search for multi-category products
3. Get comparison for top products
4. Batch-search for budget-constrained multi-item shopping
5. Verify stats persist (no cold-start reset)
6. Generate monthly ROI report from analytics

If all 6 steps work, v1.0.2 is production-ready for agent integrations.

---

## Files to Reference

- **Session 1 fixes:** `ORACLE_AUDIT_FIXES.md` (Phases A-D)
- **Session 2 features:** This document (Oracle's exact needs)
- **Complete audit:** `memory/2026-02-24-oracle-audit.md`
- **Executive summary:** `ORACLE_AUDIT_SUMMARY.md`

---

**Next:** Confirm with Laurent, then start Session 1 (catalog + auth + MCP tools + DX quick wins).
