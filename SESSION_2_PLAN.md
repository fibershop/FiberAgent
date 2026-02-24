# Session 2 Plan — Production Readiness (8.5/10)
## **NO DATABASE — Fiber API First**

**Timeline:** 8-10 hours  
**Target Score:** 8.5/10 (production-ready for ClawHub + community)  
**Architecture:** Stateless, API-driven (Fiber is source of truth)  
**Status:** 🚀 STARTING NOW

---

## Overview

Session 1 delivered a working MVP with all core features (auth, MCP, docs). Session 2 focuses on:
1. **Fiber stats integration** — Call Fiber API for agent analytics
2. **Smart comparison** — Compare cashback across merchants (Fiber data)
3. **Rich analytics** — Aggregate Fiber searches + conversions into leaderboards
4. **Reliability** — Rate limiting, caching, error handling

**KEY DECISION:** No local database. Fiber API is the source of truth. We aggregate and present.

---

## Architecture Decision: API-First, Stateless

### Why No Database?
- ✅ Fiber is already tracking stats (their source)
- ✅ Serverless deployment (no DB management)
- ✅ Fewer moving parts (easier to scale)
- ✅ Always in sync with Fiber data
- ✅ No duplication of truth

### How It Works:
```
User Agent → FiberAgent API → Fiber API (stats)
                           ↓
                        Cache (Redis, optional)
                           ↓
                     Return to User
```

**All data flows from Fiber. We aggregate and present.**

---

## Task 1: Integrate Fiber Stats API (2-3 hours)

### What to do:
1. **Discover Fiber's stats endpoints:**
   - Does Fiber expose `/v1/agent/{agent_id}/stats`?
   - Does Fiber expose `/v1/agent/{agent_id}/conversions`?
   - Does Fiber expose `/v1/agent/{agent_id}/history`?
   - What data is available?

2. **Create wrapper endpoint** (`/api/agent/{id}/stats`):
   - Call Fiber API: `GET https://api.fiber.shop/v1/agent/{id}/stats`
   - If Fiber returns stats, format and return
   - If Fiber doesn't have stats yet, return mock/demo data with note
   - Include: searches, conversions, revenue, trends

3. **Update demo data to show Fiber format:**
   - When Fiber releases stats endpoint, live data will auto-flow
   - Until then, show realistic demo structure

4. **Add response caching** (optional, for speed):
   - Cache Fiber API response for 5 minutes (Redis or in-memory)
   - Prevents hammering Fiber API on every request
   - Still fresh enough for real-time use

**Files to create/modify:**
- `api/agent/[id]/stats.js` — Call Fiber API, format response
- `api/_lib/fiber-client.js` — HTTP wrapper for Fiber API calls
- `.env` — Add Fiber API base URL (if not already there)

**Success criteria:**
- Endpoint calls Fiber API (or returns demo if not available)
- Response includes: searches, conversions, revenue
- Data is fresh (not cached older than 5 min)
- Graceful fallback if Fiber API is down

**Estimated effort:** 2-3 hours

---

## Task 2: Product Comparison Endpoint (2-3 hours)

### What to do:
1. **Create `/api/agent/compare.js`:**
   - Input: `product_name` (required), `agent_id` (optional)
   - Call Fiber API multiple times with same product name
   - Collect results from different merchants
   - Sort by cashback rate (highest first)
   - Calculate savings vs. best deal

2. **Response format:**
   ```json
   {
     "success": true,
     "product_query": "nike running shoes",
     "agent_id": "agent_001",
     "results": [
       {
         "rank": 1,
         "title": "Nike Pegasus 41",
         "merchant": "Finish Line",
         "price": 145,
         "cashback_rate": 3.25,
         "cashback_amount": 4.71,
         "savings_vs_best": 0,
         "affiliate_link": "https://fiberagent.shop/r/..."
       },
       {
         "rank": 2,
         "title": "Nike Pegasus 41",
         "merchant": "NIKE",
         "price": 145,
         "cashback_rate": 0.65,
         "cashback_amount": 0.94,
         "savings_vs_best": -3.77,
         "affiliate_link": "https://fiberagent.shop/r/..."
       }
     ],
     "summary": {
       "best_merchant": "Finish Line",
       "best_cashback_rate": "3.25%",
       "total_merchant_count": 3,
       "total_savings_available": 4.71
     }
   }
   ```

3. **Add to OpenAPI spec:**
   - Document `/api/agent/compare`
   - Add code examples (curl, Python, JS)

4. **Add to MCP tools:**
   - `compare_cashback` tool now calls real endpoint
   - Update MCP_INTEGRATION_GUIDE.md with working example

**How it works:**
1. Agent calls: `GET /api/agent/compare?product_name=nike shoes&agent_id=agent_001`
2. We call Fiber API: `GET /v1/agent/search?keywords=nike shoes&agent_id=agent_001&limit=50`
3. Parse results, deduplicate by product, group by merchant
4. Sort by cashback rate (descending)
5. Return comparison table

**Files to modify:**
- `api/agent/compare.js` — New endpoint
- `api/_lib/fiber-client.js` — Reuse Fiber API wrapper
- `server/openapi.json` — Add spec
- `api/mcp.js` — Update compare_cashback tool
- `MCP_INTEGRATION_GUIDE.md` — Document with examples

**Success criteria:**
- Endpoint returns comparable products
- Sorted by cashback (highest first)
- Shows savings vs. best deal
- Works for any product name
- MCP tool calls endpoint (not static data)

**Estimated effort:** 2-3 hours

---

## Task 3: Analytics Layer (2-3 hours)
## **Aggregated View of Fiber Data**

### What to do:
1. **Agent Leaderboard** (`/api/analytics/leaderboard`):
   - Call Fiber API for top agents (if available)
   - If not, use demo data showing realistic rankings
   - Include: agent_id, total_conversions, total_revenue, growth
   - Show top 10 agents across FiberAgent network

2. **Trending Products** (`/api/analytics/trending`):
   - Query Fiber API for most-searched products (last 7 days)
   - Get conversion rates per product
   - Get revenue per product
   - Show top 10 trending

3. **Agent Profile Analytics** (`/api/agent/{id}/analytics`):
   - Call Fiber stats API for agent's detailed metrics
   - Search history (last 30 searches)
   - Conversion rate timeline
   - Top 5 searched brands (from Fiber)
   - Top 5 performed merchants
   - Revenue trend (if Fiber provides)

4. **Dashboard Updates:**
   - StatisticsPage fetches from `/api/analytics/` endpoints
   - Shows real Fiber network data (not mock)
   - Updates via API calls, not hardcoded data

**Implementation:**
- **If Fiber has these endpoints:** Call them directly
- **If Fiber doesn't have them yet:** Use demo data with note: "Coming with Fiber API v2"
- **Cache aggregations:** 15-30 min cache for expensive queries

**Files to create:**
- `api/analytics/leaderboard.js` — Top agents
- `api/analytics/trending.js` — Trending products
- `api/agent/[id]/analytics.js` — Agent deep dive

**Files to update:**
- `src/components/StatisticsPage.js` — Fetch real data from API
- `src/pages/DemoPage.js` — Show leaderboard

**Success criteria:**
- Leaderboard shows realistic agent rankings
- Trending shows real Fiber data
- Agent analytics show performance metrics
- Dashboard displays fresh network data
- Graceful fallback to demo data if Fiber endpoints not ready

**Estimated effort:** 2-3 hours

---

## Task 4: Request to Fiber API Team (TODO)

### What we need from Fiber:
**For production stats integration, please expose:**

1. **Agent Stats Endpoint:**
   ```
   GET /v1/agent/{agent_id}/stats
   
   Response:
   {
     "success": true,
     "agent_id": "agent_001",
     "total_searches": 1234,
     "total_conversions": 87,
     "total_revenue": 13050,
     "total_commissions": 652.50,
     "avg_conversion_rate": 7.0,
     "registered_at": "2026-02-15T08:00:00.000Z",
     "updated_at": "2026-02-24T14:30:00.000Z"
   }
   ```

2. **Agent Conversions History:**
   ```
   GET /v1/agent/{agent_id}/conversions?limit=50&offset=0
   
   Response:
   {
     "success": true,
     "conversions": [
       {
         "id": "conv_123",
         "product_title": "Nike Pegasus 41",
         "merchant": "NIKE",
         "price": 145,
         "cashback_rate": 0.65,
         "commission_amount": 0.94,
         "status": "completed",
         "completed_at": "2026-02-20T12:00:00.000Z"
       }
     ],
     "total": 87,
     "page": 0,
     "limit": 50
   }
   ```

3. **Top Agents Leaderboard:**
   ```
   GET /v1/analytics/agents/top?limit=10&sort_by=conversions
   
   Response:
   {
     "success": true,
     "agents": [
       {
         "agent_id": "agent_001",
         "total_conversions": 87,
         "total_revenue": 13050,
         "rank": 1
       }
     ]
   }
   ```

4. **Trending Products:**
   ```
   GET /v1/analytics/trending?limit=10&days=7
   
   Response:
   {
     "success": true,
     "products": [
       {
         "title": "Nike Pegasus 41",
         "searches": 450,
         "conversions": 32,
         "conversion_rate": 7.1,
         "revenue": 4640
       }
     ]
   }
   ```

**Timeline:** Ask Fiber about availability. Until then, use demo data + mock responses.

---

## Task 5: Rate Limiting & Error Handling (1-2 hours)

### What to do:
1. **Implement rate limiting:**
   - 100 requests/minute per agent
   - 1000 requests/hour per agent
   - Return `429 Too Many Requests` when exceeded
   - Include `Retry-After` header

2. **Add response headers:**
   ```
   X-RateLimit-Limit: 100
   X-RateLimit-Remaining: 87
   X-RateLimit-Reset: 1645564800
   X-API-Version: 1.0.0
   ```

3. **Graceful error handling:**
   - Fiber API returns error → Return 502 with retry hint
   - Timeout from Fiber → Return 504 Gateway Timeout
   - Invalid product name → Return 400 with helpful message
   - Missing auth token → Return 401 Unauthorized

4. **Create utilities:**
   - `api/_lib/ratelimit.js` — Rate limiting (in-memory, optional Redis)
   - `api/_lib/errors.js` — Error handling + formatting

**Files to create:**
- `api/_lib/ratelimit.js` — Rate limit logic
- `api/_lib/errors.js` — Error responses

**Files to update:**
- All endpoints — Add rate limit check + error handling
- `MCP_INTEGRATION_GUIDE.md` — Document rate limits + error codes

**Success criteria:**
- Rate limiting blocks excessive requests
- 429 returned with Retry-After header
- All errors include helpful messages
- Fiber API errors don't crash our API

**Estimated effort:** 1-2 hours

---

## Testing Checklist

- [ ] Call Fiber API from stats endpoint (live or demo)
- [ ] Compare endpoint returns products sorted by cashback
- [ ] Analytics endpoints show realistic data
- [ ] Rate limiting blocks 101st request with 429
- [ ] Retry-After header present on 429
- [ ] Fiber API timeout handled gracefully (504)
- [ ] Invalid product name returns 400 with message
- [ ] Missing auth token returns 401
- [ ] StatisticsPage loads real/demo data
- [ ] MCP tools call real endpoints
- [ ] All docs updated with error codes

---

## Deployment Checklist

- [ ] All code committed to Git
- [ ] Test against Fiber production API
- [ ] Error handling tested (timeout, invalid input)
- [ ] Rate limiting working
- [ ] StatisticsPage reloads with live/demo data
- [ ] Monitor logs for Fiber API errors
- [ ] Update GitHub releases with Session 2 changes
- [ ] Announce: "Session 2 Complete — Stats Live"

---

## Success Criteria for 8.5/10 (Production-Ready)

✅ **All requirements met:**
- Stats pulled from Fiber API (or realistic demo)
- Comparison endpoint working with real data
- Analytics showing Fiber network data
- Rate limiting protecting API
- Comprehensive error handling
- Comprehensive documentation
- **Zero local persistence needed**

✅ **Remaining for 9.2/10 (Session 3):**
- Batch search endpoint
- Agent reputation scoring UI
- Python/TypeScript SDK auto-generation
- Advanced filtering
- Webhook support (if Fiber adds it)

---

## Estimated Total Time

- Task 1 (Fiber stats integration): 2-3h
- Task 2 (Compare endpoint): 2-3h
- Task 3 (Analytics aggregation): 2-3h
- Task 4 (Request to Fiber): 🤝 Coordination
- Task 5 (Rate limit + errors): 1-2h
- **Testing & Deployment:** 1-2h

**Total: 8-10 hours**

---

## Key Principle: Fiber is Source of Truth

Everything we build is a **view layer** on top of Fiber's API:
- ✅ Stats? → Call Fiber
- ✅ Conversions? → Call Fiber
- ✅ Analytics? → Aggregate Fiber data
- ✅ Leaderboards? → Sort Fiber agents
- ✅ Comparison? → Query Fiber, format results

**We don't own the data. We present it beautifully.** 🎯

---

## Success = 🚀 Production-Ready (8.5/10)

When Session 2 is complete:
- ✅ Live stats from Fiber (or realistic demo while they build)
- ✅ Product comparison endpoint working
- ✅ Analytics aggregating Fiber data
- ✅ Rate limiting + error handling
- ✅ Comprehensive documentation
- ✅ **Zero database overhead**
- ✅ Ready for ClawHub + community

---

## Next Action: Start Task 1

Ready to integrate Fiber stats? I'll:
1. Check what Fiber stats endpoints are available
2. Create `/api/agent/{id}/stats.js` wrapper
3. Add response formatting + error handling
4. Test with production Fiber API ✅

Let's go! 🚀
