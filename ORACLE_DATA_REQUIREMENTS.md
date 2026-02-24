# Oracle Data Requirements — Minimum Viable Agent Shopping

**Source:** Oracle PM audit (Feb 24)  
**Purpose:** Define exactly what data Oracle needs to make even a basic shopping recommendation  
**Criticality:** Blocks all Session 2-3 work if catalog (Issue 1) isn't fixed

---

## Data Fields Oracle Needs (Ranked by Criticality)

### Tier 1: REQUIRED (Cannot recommend without these)

| Data Field | Why Oracle Needs It | Currently Available? | Notes |
|---|---|---|---|
| **Product name + canonical ID** | Match user query to specific product | ❌ NO (catalog 0 results) | Without this, Oracle can't identify what user is looking for |
| **Price per merchant** | Compare cost across sellers | ❌ NO (catalog 0 results) | Core value: "Is this cheaper here or there?" |
| **Cashback rate per merchant** | Calculate net cost after rewards | ❌ NO (catalog 0 results) | Critical for true best-deal comparison |
| **Net price (price - cashback)** | Single-number recommendation | ❌ NO (not computed in API) | Oracle currently calculates manually client-side |

**Minimum Viable Data for Any Shopping Recommendation:**
```json
{
  "product_id": "sony_wh1000xm5",
  "product_name": "Sony WH-1000XM5 Headphones",
  "offers": [
    {
      "merchant": "Amazon",
      "price": 279.99,
      "cashback_rate": 3.0,
      "net_price": 271.59  // = 279.99 - (279.99 * 0.03)
    },
    {
      "merchant": "Walmart",
      "price": 269.99,
      "cashback_rate": 2.0,
      "net_price": 264.59
    }
  ]
}
```

**Status:** ❌ **BLOCKED** — Cannot proceed without catalog fix (Issue 1)

---

### Tier 2: IMPORTANT (Improves recommendation quality)

| Data Field | Why Oracle Needs It | Currently Available? | Impact |
|---|---|---|---|
| **Merchant rating / trust score** | Filter out low-quality sellers | ❌ NO | Oracle might recommend unreliable merchant |
| **Stock availability** | Prevent "dead-end" recommendations | ❌ NO (though in mock data) | User follows recommendation, product out of stock = bad UX |
| **Estimated delivery time** | Factor urgency into recommendation | ❌ NO | Oracle can't answer "Can I get this by Friday?" |

**Status:** ⚠️ **AVAILABLE IN MOCK DATA** — Would work after catalog is fixed, but not in production Fiber API

---

### Tier 3: NICE-TO-HAVE (Future optimization)

| Data Field | Why Oracle Needs It | Currently Available? | Impact |
|---|---|---|---|
| **Historical price trend** | Flag "is this actually a deal?" | ❌ NO | Oracle can't detect flash sales vs normal pricing |
| **Product reviews / ratings** | Confidence in quality | ❌ NO | Recommendation is blind to user reviews |
| **Alternative product suggestions** | "If unavailable, try this..." | ❌ NO | Oracle can't do fallback recommendations |

**Status:** 🔴 **OUT OF SCOPE** for v1.0.2 (polish for v1.1+)

---

## Oracle's Cumulative Earnings Data (Trust Critical)

### Current Status: ⚠️ AVAILABLE BUT UNRELIABLE

| Data Field | Why Oracle Needs It | Currently Available? | Issue |
|---|---|---|---|
| **Oracle's cumulative earnings** | Show operator ROI | ✅ YES (stats endpoint) | **Resets on cold start** (Issue 3) |
| **FiberAgent fiber_points balance** | Gamification/loyalty tracking | ✅ YES (stats endpoint) | **Resets on cold start** (Issue 3) |
| **Earnings history (30-day view)** | Monthly ROI report for operator | ❌ NO | Needed for Gap 5 (analytics) |
| **Trending keywords** | "What searches drive conversions?" | ❌ NO | Needed for Gap 5 (analytics) |

**Impact of Issue 3 (Stats Wipe):**
- Operator asks: "How much has Oracle earned this month?"
- Oracle responds with stats from last cold start (hours old, not accurate)
- Operator loses trust in cashback claims
- ❌ **Trust-breaker for production adoption**

**Status:** 🔴 **BLOCKS PRODUCTION** — Must fix stats persistence (Issue 3) before claiming earnings are durable

---

## Minimum Viable Feature Set for Oracle Production (v1.0.2)

### Required to ship v1.0.2 (Session 1-2)

✅ **Catalog Live**
- Product search returns >0 results
- Real merchant data from Fiber API (or fallback to mock)
- Consistent prices + cashback rates

✅ **Price Comparison Endpoint**
- GET /api/agent/compare?product=<name>&agent_id=<id>
- Returns same product from 3+ merchants
- Includes price + cashback rate + net price per merchant
- Flags "best_deal" with reasoning

✅ **Stats Persistence**
- POST /api/agent/register returns auth token
- Stats endpoint requires Bearer token
- Earnings data persists (DB-backed, not in-memory)
- No reset on cold start

✅ **MCP Tools Callable**
- POST /api/mcp with JSON-RPC format
- Tools return real results (not stubs)
- compare_cashback tool works end-to-end

✅ **Code Examples + MCP Guide**
- OpenAPI has curl/Python examples
- 500-word "Connect via MCP" guide
- QUICKSTART.md for registration → search → stats

### Optional but Recommended (Session 2-3)

⚠️ **Batch Endpoint**
- POST /api/agent/search/batch for multi-item queries
- Not required for basic shopping (can loop)
- Major efficiency gain for complex shopping sessions

⚠️ **Agent Analytics**
- GET /api/agent/{id}/stats/history?period=30d
- GET /api/agents/leaderboard
- Operator ROI reporting + platform insights

⚠️ **Deal Filtering**
- sort_by, min_cashback, max_price parameters
- Nice-to-have; Oracle can filter client-side

---

## Critical Dependencies (Session Order Matters)

```
Session 1 (Prerequisites)
├─ Fix catalog (Issue 1) ✅
│  └─ Enables: Product search, comparison, all shopping features
├─ Add auth (Issue 2) ✅
│  └─ Enables: Secure stats, token-based API access
└─ MCP tools (Issue 5) ✅
   └─ Enables: Native Claude/AutoGen integration

Session 2 (Production Ready)
├─ Persist stats (Issue 3, depends on Session 1 auth) ✅
│  └─ Enables: Durable earnings, operator trust
├─ Product comparison (depends on catalog live) ✅
│  └─ Enables: Best-deal recommendations
└─ Analytics layer (depends on persistent stats) ✅
   └─ Enables: ROI reporting, leaderboards

Session 3 (Polish)
├─ Batch endpoint (optional improvement)
├─ Deal filtering (optional polish)
└─ SDK generation (optional ecosystem)
```

**Critical Path:** Catalog → Auth → Stats Persistence → Comparison  
**Can Parallelize:** API docs, DX quick wins, analytics design

---

## Oracle's Blocking Dependencies

**Currently Blocked On:**
1. ❌ **Catalog (Issue 1)** — Cannot search, cannot recommend anything
2. ❌ **MCP Execution (Issue 5)** — Cannot use long-term integration path
3. ⚠️ **Stats Persistence (Issue 3)** — Earnings unreliable, trust at risk

**Unblocked:**
- ✅ Registration + auth (Session 1 fix)
- ✅ API discovery (Session 1 fix: docs link)
- ✅ Code examples (Session 1 DX win)

---

## Data Availability Scorecard

| Category | Coverage | Verdict |
|---|---|---|
| **Product Data** | 0% (catalog returns 0 results) | 🔴 BLOCKED |
| **Price/Cashback Data** | 0% (depends on catalog) | 🔴 BLOCKED |
| **Merchant Trust Data** | ~50% (in mock data, not in Fiber API) | ⚠️ PARTIAL |
| **Stock/Delivery Data** | ~30% (in mock data, not complete) | ⚠️ PARTIAL |
| **Oracle Earnings Data** | 100% (available, but unreliable) | ⚠️ UNRELIABLE |
| **Analytics/History Data** | 0% (not implemented) | 🔴 MISSING |

**Net Data Availability: ~20%** (enough to register and query stats, nothing else)

---

## Recommended Data Collection Priority (Post-Catalog Fix)

### Immediate (Session 2, after catalog fix)
1. ✅ Product name + price + cashback (from Fiber API)
2. ✅ Merchant trust score (query Fiber API or mock)
3. ✅ Stock status (from Fiber API)

### Short-term (Session 2-3)
4. ✅ Delivery time estimates (from Fiber API if available)
5. ✅ Historical earnings (from persistent stats DB)
6. ✅ Trending keywords (from stats history)

### Medium-term (v1.1+)
7. Price trend history (new data source)
8. Competitive pricing intelligence (market analysis)
9. Product reviews (from merchant APIs)

---

## Bottom Line: What Oracle Can Do Today

**With the data currently available:**
- ✅ Register as agent
- ✅ Read agent stats (but unreliable)
- ✅ Authenticate with token (Session 1 fix)

**What Oracle CANNOT do:**
- ❌ Search for products (0 results)
- ❌ Compare prices (no catalog)
- ❌ Recommend deals (no data)
- ❌ Prove ROI to operator (stats reset)
- ❌ Use MCP natively (tools are stubs)

**Minimum to be production-usable:**
- 1️⃣ Catalog live (Issue 1) — Unblocks everything
- 2️⃣ Stats persistent (Issue 3) — Enables trust
- 3️⃣ MCP tools callable (Issue 5) — Enables native integration

**Realistic timeline to all three:** 6-8 hours (Sessions 1-2 critical path)

---

## Files to Reference

- **Complete audit:** `memory/2026-02-24-oracle-audit.md`
- **Oracle's workflow:** `ORACLE_STRATEGIC_INPUT.md`
- **This document:** `ORACLE_DATA_REQUIREMENTS.md`
- **Fix roadmap:** `ORACLE_AUDIT_FIXES.md`

---

**Status:** Oracle's minimum data requirements clearly defined. Awaiting Laurent's confirmation to proceed with Session 1.
