# Fiber API Recommendations — Living Document

**Last Updated:** Feb 24, 2026  
**Status:** 🔄 Living document — Add recommendations as discovered  
**For:** Fiber API Team  
**From:** FiberAgent Integration Team (Laurent + Oracle)

---

## Overview

This document captures all recommendations for improving the Fiber API based on FiberAgent integration experience. Update this file as new issues or improvements are discovered.

---

## Priority 1: Critical Fixes (Blocking Production)

### 1.0 ✅ RESOLVED: Production Search Endpoint Fixed

**Status:** ✅ FIXED (Feb 24, 2026 ~11:10 UTC)  
**What was broken:** Production endpoint returned 500 errors  
**What's fixed:** Production endpoint now working perfectly  

**Test Command (Now Works):**
```bash
curl "https://api.fiber.shop/v1/agent/search?keywords=shoes&agent_id=agent_2dbf947b6ca049b57469cf39&limit=5"
# Returns: { "success": true, "results_count": 5, "results": [ ... ] }
```

**Next Action:** Migrate FiberAgent code to use production endpoint  
**See:** `FIBER_API_MIGRATION_PROD.md` for migration details

---

### 1.1 Better Error Handling for Invalid Agent IDs

**Issue:** When agent_id doesn't exist, API returns `total_results: 0` instead of error  
**Current Behavior:** `{ "total_results": 0, "results": [] }`  
**Expected Behavior:** `{ "error": "invalid_agent_id", "status": 400, "message": "Agent ID not found or inactive" }`  
**Impact:** High — Agents can't distinguish between "no products match" vs "agent invalid"  
**Discovered by:** Oracle audit (assumed root cause of 0 results)

**Recommended Response:**
```json
{
  "success": false,
  "error": "invalid_agent_id",
  "status": 400,
  "message": "Agent ID 'test123' not found or inactive",
  "details": {
    "agent_id": "test123",
    "reason": "not_registered" | "inactive" | "rate_limited"
  }
}
```

**Implementation:** Pre-validate agent_id exists in request handler before querying catalog

---

### 1.2 Add Explicit Error Response for Catalog Issues

**Issue:** If merchant feed is down, API returns `total_results: 0` instead of error  
**Current Behavior:** Silent empty results  
**Expected Behavior:** Clear error indicating catalog is unavailable

**Recommended Response:**
```json
{
  "success": false,
  "error": "catalog_unavailable",
  "status": 503,
  "message": "Merchant catalog is temporarily unavailable",
  "retry_after_seconds": 60
}
```

**Implementation:** Add health check on startup; return 503 if catalog is down

---

### 1.3 Add HTTP Status Codes to Responses

**Issue:** All responses currently return 200, even errors  
**Current Behavior:** `{ "success": false, ... }` with HTTP 200  
**Expected Behavior:** `{ "error": ... }` with appropriate HTTP status code

**HTTP Status Mapping:**
- `400` — Invalid agent_id or request format
- `401` — Missing/invalid API authentication (if auth required)
- `403` — Agent rate-limited or access denied
- `404` — Resource not found (agent_id, product_id)
- `503` — Catalog unavailable, service degraded
- `200` — Success

---

## Priority 2: Developer Experience (High Impact, Medium Effort)

### 2.1 Publish Fiber API Integration Guide

**What's Missing:** No documentation on agent-specific usage  
**Needed:** 1-page integration guide covering:
- Working cURL example for agent search
- Python requests example
- Node.js fetch example
- Required vs optional parameters
- Expected response format with real data
- Rate limits and pagination
- Error handling examples

**Recommended Location:** `https://docs.fiber.shop/agent-integration` or GitHub wiki

**Time Estimate:** 2-3 hours

---

### 2.2 Add Rate Limits Documentation

**What's Missing:** No published rate limits  
**Needed:**
- Requests per minute per agent_id
- Daily request quota
- Burst limits
- What happens when exceeded (429 response?)

**Recommended Response on Rate Limit:**
```json
{
  "error": "rate_limit_exceeded",
  "status": 429,
  "message": "Too many requests",
  "retry_after_seconds": 60,
  "limits": {
    "requests_per_minute": 100,
    "remaining": 0,
    "reset_at": "2026-02-24T10:35:00Z"
  }
}
```

---

### 2.3 Add Response Headers for Debugging

**What's Missing:** No X-RateLimit, X-Request-ID headers  
**Needed:**
- `X-RateLimit-Limit: 100`
- `X-RateLimit-Remaining: 87`
- `X-RateLimit-Reset: 1708756800`
- `X-Request-ID: req_abc123def456`
- `X-Response-Time-Ms: 145`

**Implementation:** Add to all responses in middleware

---

### 2.4 Document Affiliate Link Format

**What's Missing:** Unclear how affiliate links work per agent  
**Needed:**
- Are links auto-generated per agent_id?
- Do earnings track correctly?
- What's the redirect flow?
- Is there a test mode for sandbox purchases?

**Recommended Documentation Section:**
```markdown
## Affiliate Links

Each search result includes an `affiliate_link` that:
- Is specific to the agent_id making the request
- Automatically tracks the referral back to the agent
- Redirects to the merchant's product page
- Earnings are credited to the agent's wallet after purchase completion

Example flow:
1. Agent gets affiliate_link: https://api.staging.fiber.shop/r/w?c=3922888&d=...
2. Agent directs user to this link
3. User purchases on Nike.com
4. Earnings credited to agent's wallet (within 30-90 days)
```

---

## Priority 3: Features (Medium Impact, Higher Effort)

### 3.1 Add Health Check Endpoint

**Endpoint:** `GET /v1/health`  
**Response:**
```json
{
  "status": "ok",
  "catalog": {
    "status": "ok",
    "product_count": 50000,
    "merchant_count": 2500,
    "last_update": "2026-02-24T10:30:00Z"
  },
  "api": {
    "uptime_hours": 720,
    "response_time_ms": 145,
    "version": "1.0"
  }
}
```

**Time Estimate:** 1 hour

---

### 3.2 Add Batch Search Endpoint

**Endpoint:** `POST /v1/agent/search/batch`  
**Request:**
```json
{
  "agent_id": "agent_xyz",
  "queries": [
    { "keywords": "laptop", "limit": 5 },
    { "keywords": "monitor", "limit": 5 }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "results": {
    "laptop": [ ... ],
    "monitor": [ ... ]
  },
  "batch_id": "batch_abc123"
}
```

**Value:** Reduces API calls for multi-item shopping (4 calls → 1 call)  
**Time Estimate:** 3-4 hours

---

### 3.3 Add Product Comparison Endpoint

**Endpoint:** `GET /v1/agent/compare?product=<name>&agent_id=<id>`  
**Response:**
```json
{
  "product": "Nike Pegasus 41",
  "offers": [
    {
      "merchant": "Nike",
      "price": 145,
      "cashback_rate": 0.65,
      "affiliate_link": "...",
      "in_stock": true
    },
    {
      "merchant": "Finish Line",
      "price": 150,
      "cashback_rate": 3.25,
      "affiliate_link": "...",
      "in_stock": true
    }
  ],
  "best_deal": "Finish Line"
}
```

**Value:** Agents can recommend best-deal merchants in one call (not N parallel calls)  
**Time Estimate:** 2-3 hours

---

### 3.4 Add Merchant Rating/Trust Score

**What's Missing:** No way to filter by merchant quality  
**Needed:** Include in search results:
```json
{
  "merchant_name": "Nike",
  "merchant_rating": 9.4,
  "merchant_rating_source": "fiber_internal",
  "trust_score": 95,
  "return_policy_days": 30,
  "avg_delivery_days": 3
}
```

**Value:** Agents can avoid recommending low-quality merchants  
**Time Estimate:** 2 hours (data collection) + 1 hour (API integration)

---

### 3.5 Add Stock/Availability Endpoint

**What's Missing:** No way to check real-time stock across merchants  
**Endpoint:** `POST /v1/agent/check-availability`  
**Request:**
```json
{
  "agent_id": "agent_xyz",
  "products": ["product_id_1", "product_id_2"],
  "merchants": ["nike.com", "finishline.com"]
}
```

**Response:**
```json
{
  "availability": [
    {
      "product_id": "nike_pegasus_41",
      "merchant": "nike.com",
      "in_stock": true,
      "quantity_available": 5,
      "last_updated": "2026-02-24T10:30:00Z"
    }
  ]
}
```

**Value:** Prevents dead-end recommendations ("product out of stock")  
**Time Estimate:** 3-4 hours

---

## Priority 4: Analytics & Insights (Lower Priority, Nice-to-Have)

### 4.1 Add Agent Performance Endpoint

**Endpoint:** `GET /v1/agent/{agent_id}/performance`  
**Response:**
```json
{
  "agent_id": "agent_xyz",
  "total_searches": 1245,
  "total_conversions": 127,
  "conversion_rate": "10.2%",
  "total_earnings_usd": 2847.50,
  "total_earnings_mon": 1423.75,
  "top_categories": ["shoes", "electronics", "supplements"],
  "top_merchants": ["Nike", "Amazon", "Best Buy"]
}
```

---

### 4.2 Add Trending Products Endpoint

**Endpoint:** `GET /v1/trending?limit=10`  
**Response:**
```json
{
  "trending": [
    {
      "product": "Nike Pegasus 41",
      "searches_last_24h": 542,
      "trend": "up",
      "avg_cashback": "0.65%"
    }
  ]
}
```

---

### 4.3 Add Leaderboard Endpoint

**Endpoint:** `GET /v1/agents/leaderboard?period=30d`  
**Response:**
```json
{
  "period": "30d",
  "leaderboard": [
    {
      "rank": 1,
      "agent_id": "agent_xyz",
      "total_conversions": 542,
      "total_earnings": 8945.50
    }
  ]
}
```

---

## Testing & Validation Checklist

- [ ] Test with valid agent_id → returns products
- [ ] Test with invalid agent_id → returns 400 error
- [ ] Test with no results → returns empty array (not error)
- [ ] Test rate limiting → returns 429 when exceeded
- [ ] Test batch endpoint → all queries succeed together
- [ ] Test comparison endpoint → same product from multiple merchants
- [ ] Test affiliate links → tracking works end-to-end
- [ ] Test response headers → X-RateLimit headers present

---

## Discovered Issues to Fix

| Date | Issue | Status | Priority |
|------|-------|--------|----------|
| 2026-02-24 | Invalid agent_id returns 0 results instead of error | 🔴 Critical | P1 |
| 2026-02-24 | No error handling for catalog downtime | 🔴 Critical | P1 |
| 2026-02-24 | No documentation for agent integration | 🟠 High | P2 |
| 2026-02-24 | Rate limits not published | 🟠 High | P2 |
| 2026-02-24 | No batch search endpoint | 🟡 Medium | P3 |
| 2026-02-24 | No product comparison endpoint | 🟡 Medium | P3 |

---

### ✅ RESOLVED: Production Migration (Feb 24)

**Issue:** Fiber API migrated from staging to production, search was temporarily broken  
**Status:** ✅ FIXED BY FIBER TEAM  
**Details:**
- Old endpoint: `https://api.staging.fiber.shop/v1` ✅ Still works
- New endpoint: `https://api.fiber.shop/v1` ✅ NOW WORKING

**Production Test Result (Feb 24 ~11:10 UTC):**
```json
{
  "success": true,
  "query": "running shoes",
  "results_count": 5,
  "results": [ { "title": "Nike Pegasus 41", "price": 145, ... } ],
  "pagination": { "total": 14, "page": 0, "total_pages": 3 }
}
```

**Production Test Agent:**
- Agent ID: `agent_2dbf947b6ca049b57469cf39`
- Wallet: `0x0699bE7e51c21F27e70164c2a1aA76E85B2e5343`
- Status: ✅ Active and working

**Next:** Migrate FiberAgent code to production endpoint

---

## Quick Fixes (Can Do This Week)

**FiberAgent Team (Now That Production is Fixed):**
1. **Migrate code to production endpoint** (2-3 hours)
   - Update API URLs from staging to production
   - Test all endpoints
   - Deploy to Vercel
   
2. **Error response for invalid agent_id** (1 hour)
3. **HTTP status codes** (30 minutes)
4. **Rate limit headers** (1 hour)
5. **Integration guide** (2-3 hours)

**Total: 6.5-8.5 hours** (for complete P1 fixes)

---

## How to Use This Document

- **For engineers:** Use this as the implementation backlog
- **For product:** Use this to prioritize Fiber API improvements
- **For FiberAgent team:** Reference this when reporting issues

**Update process:**
1. Discover a new issue or improvement
2. Add to appropriate Priority section
3. Include: Issue, Current Behavior, Expected Behavior, Impact, Time Estimate
4. Update the "Discovered Issues" table
5. Commit with message: "Add recommendation: [brief description]"

---

## Contact & Discussion

**For questions about these recommendations:**
- Laurent (@LaurentCrypto) — FiberAgent Product Lead
- Oracle (AI Agent) — Integration partner
- FiberAgent team

**Estimated Total Time to Implement All Recommendations:** 20-25 hours  
**Estimated Time to Implement Priority 1-2:** 6.5-8.5 hours  
**Estimated Score Improvement with Priority 1-2:** 6.0/10 → 7.0/10  

**STATUS:** ✅ PRODUCTION FIXED - Ready to migrate  
**NEXT:** Update FiberAgent code to use production endpoint  
**ETA:** Can start immediately

---

**Last reviewed:** Feb 24, 2026  
**Next review:** As recommendations are implemented or new issues discovered
