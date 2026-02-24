# Oracle PM Audit — FiberAgent Critical Issues (Feb 24)

## Audit Source
**Prepared by:** Oracle Subagent (PM Review)  
**Date:** 2026-02-23  
**Audited Docs:** API-DEEP-DIVE.md, MCP-PROTOCOL.md, FRONTEND-UX.md, DOCS-AND-GAPS.md

---

## Critical Findings Summary

FiberAgent architecture is sound, but **4 blocking issues** prevent production integration:

### 🔴 Issue 1 — Merchant Catalog Returns Zero Results (BLOCKER)
**Problem:**
- Every `/api/agent/search` call returns `total_results: 0` with empty `results[]`
- Indicates backend is empty or data pipeline disabled
- Core value proposition (search 50K+ merchants) is completely unavailable

**Impact:**
- Any agent cannot retrieve products, prices, or cashback rates
- Entire shopping workflow fails at step one
- Oracle cannot ship integration

**Fix Required:**
1. Restore Fiber API data pipeline (verify API key/feed is active)
2. Add `/health` endpoint to detect catalog availability
3. Return explicit error rather than silent empty results

---

### 🔴 Issue 2 — No Authentication on API (SECURITY RISK)
**Problem:**
- API uses `agent_id` as identifier only, not credential
- No token or secret required to query any endpoint (including stats)
- `agent_id` is agent-supplied at registration, not system-generated

**Impact:**
- Competitor agents can read Oracle's earnings, conversion stats, cashback data
- Stats endpoint cannot be trusted as source of truth
- Bad actors could scrape revenue performance or manipulate agent state

**Fix Required:**
1. Implement token-based auth (return JWT/secret on registration)
2. Require Bearer token on all subsequent API calls
3. Use `agent_id` as public identifier only, not auth mechanism
4. Add token rotation/revocation mechanism

---

### 🔴 Issue 3 — Serverless Cold Start Wipes Stats (DATA INTEGRITY BUG)
**Problem:**
- `/agent/{agent_id}/stats` response notes "Stats reset on cold start (serverless)"
- All earnings, conversions, search history is non-persistent in-memory
- Can reset at any time with no warning

**Impact:**
- Oracle cannot reliably track cumulative cashback earnings
- Conversion attribution breaks across sessions
- ROI tracking and reward accumulation impossible
- Reported stats are unreliable

**Fix Required:**
1. **Mandatory:** Persist stats to durable external store (Postgres, Redis with AOF, DynamoDB, etc.)
2. Move state layer OUT of function runtime entirely
3. Non-negotiable for any production agent integration
4. Document fallback if persistence layer is unavailable

---

### 🟠 Issue 4 — No Rate Limiting Documented or Enforced
**Problem:**
- No rate limit headers observed
- No quota policy documented
- No fair-use documentation in API docs

**Impact:**
- Oracle cannot design batch workflows safely (doesn't know if it will be throttled)
- Runaway agent loops could generate unlimited API calls
- Unexpected costs or service degradation for all users

**Fix Required:**
1. Implement rate limits (e.g., 100 req/min per agent_id, or per agent + IP)
2. Return `Retry-After` headers on 429 responses
3. Publish rate limit policy in API docs + README
4. Add quota tracking per agent (optional: paid tier limits)

---

### 🔴 Issue 5 — MCP Tools Listed But Not Executable via Endpoint
**Problem:**
- GET `/api/mcp` returns static configuration metadata (tool names, resource URIs, prompt templates)
- Provides NO mechanism to invoke the 5 listed tools:
  - `search_products`
  - `search_by_intent`
  - `register_agent`
  - `get_agent_stats`
  - `compare_cashback`
- Endpoint is a stub, not a real MCP Streamable HTTP transport

**Impact:**
- Oracle cannot use MCP layer as intended
- MCP clients receive capability manifest but cannot execute tool calls
- `compare_cashback` tool (most valuable) is listed but entirely inaccessible
- MCP integration guide promises functionality that doesn't exist

**Fix Required:**
1. Implement MCP Streamable HTTP transport correctly
2. Handle JSON-RPC `tools/call` requests server-side
3. Map each tool to backend endpoint (search_products → /api/agent/search, etc.)
4. Return proper MCP response format with results or errors
5. Test with Claude Desktop MCP client

**Files to Update:**
- `fiber-shop-landing/api/mcp.js` — Implement real tool handlers
- `MCP_INTEGRATION_GUIDE.md` — Update examples to show tool calls
- `SKILL.md` — Document callable tools with examples

---

### 🟠 Issue 6 — No API Documentation Link from Homepage
**Problem:**
- API docs at `/api/docs` only discoverable if you already know the URL
- Homepage has no developer section, no docs link, no integration guide
- Discovery friction for new agent developers

**Impact:**
- Agent developers have no clear path: "I want to integrate" → "how do I call the API?"
- Retention killer for developer sign-ups
- Discoverability issues (SEO, OpenGraph, metadata)

**Fix Required:**
1. Add "For Developers" or "Agent Integration" section to homepage
2. Link to `/api/docs` prominently
3. Add MCP quickstart code snippet
4. Link to GitHub releases + installation instructions
5. Consider adding `/docs` landing page with navigation

**Files to Create/Update:**
- `fiber-shop-landing/src/pages/HomePage.js` — Add developer section
- `fiber-shop-landing/src/pages/DevelopersPage.js` — Already exists but not linked prominently
- Consider: New `/docs` landing page with site map

---

## 3. Developer Experience Issues

### Missing Code Examples in OpenAPI
**Problem:**
- OpenAPI spec at `/api/docs` defines endpoints clearly (parameters, response schemas)
- Contains **zero code examples** — no curl, Python, JavaScript
- Agent developers must write boilerplate from schema alone

**Impact:**
- Slow time-to-integration
- No reference implementations for agent frameworks (LangChain, AutoGen, custom)
- High friction for first-time adopters

**Fix (Quick):**
- Add `x-code-samples` blocks to OpenAPI spec for each endpoint
- Cover: curl, Python, JavaScript
- Can be auto-generated from schema in <1 hour

**Estimated Effort:** 1 hour

---

### Incomplete MCP Integration Guide
**Problem:**
- Endpoint exists + returns capability manifest ✓
- **BUT:** No guide on how to connect MCP client (Claude, AutoGen, custom MCP host)
- Tool parameters, invocation patterns, auth for MCP completely undocumented

**Impact:**
- Agent developers wanting to use MCP (the right integration path) cannot proceed without trial-and-error
- Must read MCP spec from scratch
- Blocks production MCP adoptions

**Fix (Quick):**
- Write 500-word guide: "Connect your AI agent via MCP"
- Cover: (1) endpoint URL, (2) tools/list request, (3) example tools/call for search_products, (4) response parsing
- Can use examples from existing MCP_INTEGRATION_GUIDE.md

**Estimated Effort:** 1-2 hours

---

### No SDK or Client Libraries
**Problem:**
- No SDK referenced in docs, homepage, or MCP metadata
- No GitHub repository linked anywhere
- Every developer implements HTTP client from scratch

**Impact:**
- High integration time
- Inconsistent implementations across agents
- Raises adoption bar for developers

**Recommended Fix:**
- Publish Python SDK (highest demand from agent developers)
- Publish TypeScript/Node.js SDK (for Node-based frameworks)
- Use openapi-generator to auto-generate from OpenAPI spec

**Estimated Effort:** 1-2 days (per language)

**Priority:** Session 3+ (low blocker, but high polish)

---

### Minimal Onboarding Documentation
**Problem:**
- No quickstart guide, no "Hello World" tutorial
- No FAQ, troubleshooting, terms of service
- No SLA, support contact, or usage policy
- No explanation of cashback calculation/payout flow

**Impact:**
- Developer evaluating FiberAgent cannot answer basic trust questions:
  - How do I get paid?
  - What are the rate limits?
  - What happens if endpoint is down?
- Blocks enterprise/production adoption

**Fix (Quick):**
- Single QUICKSTART.md covering: registration → first search → stats retrieval
- Include working code (curl + Python)
- Add FAQ: "How do I get paid?", "What are rate limits?", "SLA?"

**Estimated Effort:** 2-3 hours

---

## 4. Product Gaps (Features Needed for Agent Value)

### Gap 1 — Product Comparison Tool (Price Across Merchants)
**Current State:**
- Search returns zero results (blocked by Issue 1)
- No API for comparing same product across merchants in single call
- `compare_cashback` tool listed but unimplemented

**Agent Value Unlock:**
- Oracle needs: "Is this $49 on Amazon and $39 on Walmart?"
- Without this: Must issue N parallel searches and deduplicate client-side
- With this: Single call returns best deal across all merchants

**Recommended Design:**
```
GET /api/agent/compare?product=<canonical_id_or_name>&agent_id=<id>

Response:
{
  "product": "Nike Pegasus 41",
  "offers": [
    {
      "merchant": "Walmart",
      "price": 139.99,
      "cashback_rate": "3.5%",
      "cashback_amount": 4.90,
      "net_price": 135.09
    },
    {
      "merchant": "Amazon",
      "price": 149.99,
      "cashback_rate": "1%",
      "cashback_amount": 1.50,
      "net_price": 148.49
    }
  ],
  "best_deal": { "merchant": "Walmart", "net_price": 135.09 }
}
```

**Estimated Effort:** 2-3 hours (once catalog is live + auth added)

---

### Gap 2 — Deal Ranking / Filtering
**Current State:**
- No filtering or ranking in search API
- Only `size` parameter supported
- Cannot sort or limit by cashback, price, rating, delivery speed

**Agent Value Unlock:**
- Oracle needs: "Give me the top 3 shoes under $150 with >2% cashback"
- Without this: Must download all results client-side and rank
- With this: Single API call with filters

**Recommended Design:**
```
GET /api/agent/search?keywords=shoes&sort_by=cashback&min_cashback=2&max_price=150

Query Parameters:
  - sort_by: cashback | price | rating | delivery (default: relevance)
  - min_cashback: minimum % (e.g., 2 → ≥2%)
  - max_price: maximum price (e.g., 150 → ≤$150)
  - min_rating: merchant rating (e.g., 8 → ≥8.0)
  - in_stock: true | false
  - merchants: comma-separated merchant IDs (whitelist specific stores)
```

**Estimated Effort:** 2-3 hours (add to searchProducts + searchFiberAPI)

---

### Gap 3 — Batch Product Lookup
**Current State:**
- Single-query only endpoint
- No batch capability
- Agent must make sequential or parallel calls

**Agent Value Unlock:**
- Oracle needs: "Find laptop, monitor, desk for under $2000 total"
- Without this: 3+ sequential API calls + manual budget allocation
- With this: Single call with cross-item optimization

**Recommended Design:**
```
POST /api/agent/search/batch
{
  "agent_id": "oracle_001",
  "queries": [
    { "keywords": "laptop", "max_price": 1000 },
    { "keywords": "monitor", "max_price": 400 },
    { "keywords": "desk", "max_price": 600 }
  ]
}

Response:
{
  "results": {
    "laptop": [ ... ],
    "monitor": [ ... ],
    "desk": [ ... ]
  },
  "total_budget_used": 1826.50,
  "total_cashback": 85.32
}
```

**Constraints:**
- Max 10 queries per batch
- Max 1 batch request per second (rate limit)
- Useful for budget-aware shopping (user says $2000, agent finds optimal combo)

**Estimated Effort:** 2-3 hours (create `/api/agent/search/batch.js`)

---

### Gap 4 — Persistent Merchant Catalog (CRITICAL PREREQUISITE)
**Current State:**
- Zero results for all queries
- Catalog is the product — without it, nothing works

**Agent Value Unlock:**
- This is a prerequisite for every other feature
- Until catalog is live, FiberAgent has no functional value

**Recommended Fix:**
- **Not a design problem** — it's operational
- Wildfire affiliate feed must be connected, indexed, queryable
- Single highest-leverage fix on entire roadmap

**Priority:** FIX THIS FIRST (Issue 1, Phase A)

---

### Gap 5 — Agent Profiling / Revenue Attribution (Analytics Layer)
**Current State:**
- Stats endpoint exists: `total_searches`, `total_earnings`, `conversions`, `cashback_totals`, `fiber_points`
- **BUT:** All data lost on every cold start (tied to Issue 3)
- No analytics layer, no historical trends, no platform-level insights
- No way to identify top-performing agents or attribute revenue to integrations

**Agent Value Unlock (Oracle):**
- Cannot demonstrate ROI to operator if earnings reset arbitrarily
- Need: "I saved you $X this month via FiberAgent cashback" monthly reports
- Need: Historical earnings trends to show platform value

**Platform Value (FiberAgent):**
- Cannot identify top-performing agent integrations
- Cannot prioritize partnerships or build leaderboards
- Cannot track which agents drive most revenue
- Cannot optimize commission structure without attribution data

**Recommended Design:**

1. **Persist all stats events to time-series store:**
   ```
   Table: agent_stats_events
   Columns:
     - agent_id (string, indexed)
     - event_type (search | purchase | earnings_settled)
     - amount (float, for earnings)
     - timestamp (ISO-8601, indexed)
     - metadata (JSON)
   ```

2. **Add historical stats endpoint:**
   ```
   GET /api/agent/{agent_id}/stats/history?period=7d|30d|90d|custom
   
   Response:
   {
     "agent_id": "oracle_001",
     "period": "30d",
     "stats": {
       "searches": 245,
       "conversions": 12,
       "cashback_earned": 127.50,
       "daily_breakdown": [
         {
           "date": "2026-02-24",
           "searches": 8,
           "conversions": 0,
           "cashback": 0
         },
         ...
       ],
       "trend": "up" | "stable" | "down"
     }
   }
   ```

3. **Add platform-level leaderboard:**
   ```
   GET /api/agents/leaderboard?sort_by=earnings|searches|conversions&period=30d
   
   Response:
   {
     "leaderboard": [
       {
         "rank": 1,
         "agent_id": "oracle_001",
         "agent_name": "Oracle",
         "total_earnings": 2847.50,
         "total_searches": 3422,
         "total_conversions": 127
       },
       ...
     ]
   }
   ```

4. **Add agent-level trend data:**
   ```
   GET /api/agent/{agent_id}/stats/trends
   
   Response:
   {
     "trending_keywords": [
       { "keyword": "shoes", "searches": 120, "conversions": 8, "conversion_rate": "6.7%" },
       { "keyword": "laptop", "searches": 95, "conversions": 3, "conversion_rate": "3.2%" }
     ],
     "top_merchants": [
       { "merchant_id": 3922888, "name": "Nike", "conversions": 34 },
       { "merchant_id": 5517209, "name": "Finish Line", "conversions": 28 }
     ]
   }
   ```

**Estimated Effort:** 2-3 hours (once Issue 3 persistence is done)

**Dependencies:**
- Requires Issue 3 (stats persistence) to be complete first
- Requires durable stats schema with timestamps
- Works best with time-series DB (Postgres with partitioning, or native time-series like TimescaleDB/InfluxDB)

**Session:** Session 2 or early Session 3 (after persistence is stable)

---

## Risk Assessment

| Item | Type | Severity | Blocks Oracle | Blocks ClawHub | Blocks Community |
|------|------|----------|--------------|---|---|
| **Catalog Returns 0 Results** | Issue 1 | **BLOCKER** | ✅ YES | ✅ YES | ✅ YES |
| **No Auth on API** | Issue 2 | **HIGH** | ⚠️ (data exposure) | ✅ (trust) | ✅ (security) |
| **Serverless Wipes Stats** | Issue 3 | **HIGH** | ✅ (tracking) | ⚠️ (demo ok) | ⚠️ (can demo) |
| **No Rate Limiting** | Issue 4 | **MEDIUM** | ⚠️ (future) | ⚠️ (scaling) | ⚠️ (abuse) |
| **MCP Tools Not Callable** | Issue 5 | **HIGH** | ✅ YES | ⚠️ (feature claim) | ✅ YES |
| **No API Docs Link** | Issue 6 | **MEDIUM** | ⚠️ (friction) | ⚠️ (onboarding) | ✅ (discovery) |
| **Product Comparison** | Gap 1 | **HIGH** | ✅ (core value) | ⚠️ (nice-to-have) | ✅ (killer feature) |
| **Deal Ranking/Filtering** | Gap 2 | **MEDIUM** | ⚠️ (nice-to-have) | ⚠️ (polish) | ⚠️ (UX) |
| **Batch Lookup** | Gap 3 | **MEDIUM** | ⚠️ (optimization) | ⚠️ (polish) | ⚠️ (advanced) |
| **Persistent Catalog** | Gap 4 | **BLOCKER** | ✅ YES | ✅ YES | ✅ YES |
| **Agent Profiling/Analytics** | Gap 5 | **HIGH** | ✅ (ROI tracking) | ⚠️ (nice-to-have) | ✅ (leaderboards) |

---

## Recommended Action Plan

### Phase A: Unblock Catalog (URGENT — Do First)
```
1. Verify Fiber API integration is live (check fiber.shop/v1)
2. Test search endpoint with real agent_id + keywords
3. If returns 0, debug data pipeline (API key, merchant feed, etc.)
4. Add health check endpoint (/api/health) to detect failures early
5. Re-test with Oracle agent before next communication
```

**Estimated:** 1-2 hours (if pipeline is active; longer if data source is broken)

---

### Phase B: Add Authentication (HIGH PRIORITY)
```
1. Modify /api/agent/register.js to return auth token (JWT or signed UUID)
2. Require Bearer token on: /api/agent/search, /api/agent/{id}/stats, /api/agent/{id}.js
3. Store token hash (not plaintext) in durable DB or Redis
4. Add token rotation endpoint (/api/agent/{id}/rotate-token)
5. Document in API spec + README + SKILL.md
6. Update MCP_INTEGRATION_GUIDE.md with auth examples (cURL, Node.js, Python, JavaScript)
```

**Estimated:** 2-3 hours  
**Impact:** Enables secure agent-to-agent integrations, prevents unauthorized stats scraping

---

### Phase C: Persist Stats (ESSENTIAL FOR PRODUCTION)
```
1. Choose durable store: Postgres (preferred), Redis, or DynamoDB
2. Move in-memory stats store to external persistence layer
3. Keep in-memory cache for performance (cache-aside pattern)
4. Add graceful fallback if persistence layer is down
5. Document in API spec + deployment instructions
6. Test with multiple agents in parallel (concurrent state updates)
```

**Estimated:** 3-4 hours  
**Impact:** Enables reliable earnings tracking, conversion attribution, agent profiling

---

### Phase D: Add Rate Limiting (MEDIUM PRIORITY)
```
1. Choose rate limiting strategy: token bucket or sliding window
2. Implement per-agent limits (e.g., 100 req/min)
3. Return 429 with Retry-After header on limit exceeded
4. Add rate limit headers to all responses (X-RateLimit-* headers)
5. Document limits in README + API spec + SKILL.md
6. Consider paid tier with higher limits (future)
```

**Estimated:** 1-2 hours  
**Impact:** Prevents abuse, allows agents to design safe workflows

---

## Deployment Order (Recommended)

### Critical Path (Session 1 — TODAY)
1. **Fix catalog** (Issue 1) — Unblock all product searches
2. **Add auth** (Issue 2) — Security baseline
3. **Fix MCP endpoint** (Issue 5) — Implement real tool handlers
4. **Add API docs link** (Issue 6) — Homepage discovery
5. **Add code examples to OpenAPI** (DX) — curl + Python snippets
6. **Write MCP connection guide** (DX) — Quick 500-word "Connect your agent" doc

**Estimated:** 8-10 hours (was 6-8h, +2-4h for DX quick wins)  
**Enables:** Oracle can search products, execute MCP tools, find docs, and developers have code examples + MCP guide

### Production Readiness (Session 2)
1. **Persist stats** (Issue 3) — Production-grade state management + time-series schema
2. **Add rate limiting** (Issue 4) — Scalability + abuse prevention
3. **Implement product comparison** (Gap 1) — Core value unlock for agents
4. **Add agent profiling/analytics** (Gap 5) — Historical trends + leaderboard (depends on stats persistence)
5. **Complete QUICKSTART.md** (DX) — If not finished in Session 1
6. **Add FAQ + SLA docs** (DX) — Cashback flow, rate limits, SLA, support contact

**Estimated:** 10-12 hours (includes Gap 5 analytics + DX trust docs)  
**Enables:** Reliable earnings tracking, agent-to-agent safe usage, price comparison, ROI attribution, trust-building documentation

### Polish & Distribution (Session 3)
1. **Add deal ranking/filtering** (Gap 2) — Agent optimization
2. **Add batch lookup** (Gap 3) — Multi-item budget optimization
3. **Auto-generate Python SDK** (DX) — openapi-generator → pypi publication
4. **Auto-generate TypeScript SDK** (DX) — openapi-generator → npm publication
5. **Update all documentation** — README, SKILL.md, MCP guide
6. **Re-test with Oracle + 2+ agents** — Integration validation
7. **Publish v1.0.2 patch release** — GitHub tag + ClawHub submission

**Estimated:** 6-8 hours (includes SDK generation + testing)  
**Enables:** Production release, SDK availability, community promotion, broader agent adoption

---

## Impact on Distribution Channels

| Channel | Current Status | Impact if Fixed | Impact if Not Fixed |
|---------|---|---|---|
| GitHub | Published (v1.0.1) | Ready for v1.0.2 | Marked "alpha/experimental" |
| ClawHub | Ready to submit | **Can submit** | Should wait for fixes |
| npm | Blocked on 2FA | Ready when 2FA resolved | Not worth publishing (broken) |
| Community | Ready to promote | Promote with fixes | Hold promotion until fixed |

**Recommendation:** Hold ClawHub + community promotion until **at least Phase A + B** are complete. Catalog + auth are non-negotiable for credibility.

---

## Key Questions for Laurent

1. **Fiber API Status:** Is `fiber.shop/v1` currently returning merchant data, or was it never populated?
2. **Data Persistence:** Do we have Postgres/Redis available in Vercel environment, or should we use DynamoDB/Firestore?
3. **Timeline:** What's the priority? Fix by end of week (Feb 28) or defer to next phase?
4. **Distribution:** Should we pause ClawHub submission until these are fixed, or publish with "Known Issues" disclaimer?

---

## Files to Create/Update

**New:**
- `API_HEALTH_CHECK.md` — Deployment instructions for health check + data validation
- `API_SECURITY.md` — Auth mechanism, token rotation, best practices

**Update:**
- `fiber-shop-landing/api/agent/search.js` — Catalog + auth fixes
- `fiber-shop-landing/api/agent/[id]/stats.js` — Persistence layer
- `fiber-shop-landing/api/mcp.js` — Rate limiting headers
- `MCP_INTEGRATION_GUIDE.md` — Auth examples
- `SKILL.md` — Auth + rate limit documentation
- `README.md` — Security + reliability notes

---

## Implementation Details — Issues 5 & 6

### Issue 5: Implement Real MCP Tool Handlers

**Current Problem:**
- `/api/mcp.js` returns static metadata only
- No JSON-RPC request handling
- Tools listed but not callable

**Fix Implementation:**

1. **Update `/api/mcp.js` to handle tool calls:**
```javascript
// Current: returns static GET response only
// New: handle POST requests with JSON-RPC format

// POST /api/mcp
// Body: { "jsonrpc": "2.0", "method": "tools/call", "params": { ... }, "id": 1 }

// Dispatch to handlers:
const toolHandlers = {
  search_products: async (params) => {
    // Calls searchFiberAPI or fallback
    return await fetch('/api/agent/search?...');
  },
  register_agent: async (params) => {
    // Calls /api/agent/register
    return await registerAgent(params.agent_id, params.agent_name);
  },
  get_agent_stats: async (params) => {
    // Calls /api/agent/{id}/stats
    return await fetch(`/api/agent/${params.agent_id}/stats`);
  },
  compare_cashback: async (params) => {
    // Calls /api/agent/compare (NEW)
    return await fetch('/api/agent/compare?...');
  }
};
```

2. **Create `/api/agent/compare.js` endpoint** (for compare_cashback tool):
```javascript
// GET /api/agent/compare?product=<name_or_id>&agent_id=<id>
// Returns same product from multiple merchants with prices + cashback overlay
```

3. **Update `MCP_INTEGRATION_GUIDE.md`** with real tool call examples:
```bash
# Before: Only listed tool names
# After: Show actual cURL examples for tool invocation

curl -X POST https://fiberagent.shop/api/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "search_products",
      "arguments": {
        "keywords": "shoes",
        "agent_id": "oracle_001"
      }
    },
    "id": 1
  }'
```

**Estimated Effort:** 3-4 hours

**Files to Create/Update:**
- `fiber-shop-landing/api/mcp.js` — Add JSON-RPC request handler
- `fiber-shop-landing/api/agent/compare.js` — NEW product comparison endpoint
- `MCP_INTEGRATION_GUIDE.md` — Real tool call examples
- `SKILL.md` — Tool invocation documentation

---

### Issue 6: Add API Documentation Link from Homepage

**Current Problem:**
- `/api/docs` exists but not discoverable
- Homepage has no "For Developers" section
- No integration guide link

**Fix Implementation:**

1. **Update `HomePage.js`:**
```javascript
// Add section after hero:
// "For Developers" card with:
//   - "Integrate FiberAgent" heading
//   - Short description of API + MCP
//   - "View Documentation" button → /api/docs
//   - "Installation Guide" button → GitHub/npm instructions
```

2. **Create `/docs` landing page** (optional but recommended):
```
/docs/
├── Installation.md (GitHub, npm, local, ClawHub)
├── QuickStart.md (5-minute integration)
├── API.md (endpoint reference)
├── MCP.md (tool definitions + examples)
├── SKILL.md (OpenClaw integration)
└── FAQ.md
```

3. **Update Navigation.js to include "Docs" link** (if creating `/docs` landing page)

4. **Add metadata to homepage** (SEO):
```html
<meta name="description" content="API and OpenClaw skill for AI agent shopping integration" />
<meta property="og:description" content="..." />
```

**Estimated Effort:** 1-2 hours

**Files to Create/Update:**
- `fiber-shop-landing/src/pages/HomePage.js` — Add developer section
- `fiber-shop-landing/src/pages/DocsLandingPage.js` — NEW (optional)
- `fiber-shop-landing/src/components/Navigation.js` — Add Docs link (optional)
- `fiber-shop-landing/public/index.html` — Update meta tags

---

## Files to Create/Update (Complete List)

### Critical Issues (Session 1)
**Create:**
- [ ] `/api/agent/compare.js` — Product comparison endpoint
- [ ] `/api/agent/search/batch.js` — Batch search endpoint (Session 2)
- [ ] `API_HEALTH_CHECK.md` — Health check guidance
- [ ] `API_SECURITY.md` — Auth best practices
- [ ] `API_RATE_LIMITING.md` — Rate limit policy

**Update:**
- [ ] `fiber-shop-landing/api/agent/search.js` — Fix catalog + rate limiting
- [ ] `fiber-shop-landing/api/agent/register.js` — Return auth token
- [ ] `fiber-shop-landing/api/agent/[id]/stats.js` — Persist to DB
- [ ] `fiber-shop-landing/api/mcp.js` — Implement real tool handlers + compare
- [ ] `fiber-shop-landing/api/health.js` — NEW health check endpoint
- [ ] `fiber-shop-landing/src/pages/HomePage.js` — Add developer section + docs link
- [ ] `fiber-shop-landing/public/.well-known/agent-card.json` — Update schema
- [ ] `MCP_INTEGRATION_GUIDE.md` — Real tool call examples
- [ ] `SKILL.md` — Auth + callable tools documentation
- [ ] `README.md` — Production readiness section
- [ ] `memory/2026-02-24-oracle-audit.md` — This document (progress tracking)

---

## 5. Recommendations (Priority Order)

### Top 3 Immediate Fixes (Impact vs. Effort)

| Priority | Fix | Impact | Effort | Rationale |
|----------|-----|--------|--------|-----------|
| **#1** | Restore merchant catalog (fix empty search results) | 🔴 Critical | Medium | Zero products = zero value. Everything else blocked. No agent can demo or use platform until results return. |
| **#2** | Persist agent stats (fix cold-start reset) | 🔴 High | Medium | Without durable data, FiberAgent cannot credibly claim cashback earnings. Trust-breaker for production integration. |
| **#3** | Add Bearer token auth to API | 🟠 High | Low | Real agents with real earnings shouldn't be queryable by anyone with guessed agent_id. 401-gated stats endpoint is one-day fix. |

---

### Next 5 Features (Ranked by Agent Value)

| Rank | Feature | Agent Value | Notes |
|------|---------|-------------|-------|
| 1 | **Deal ranking/filtering** (sort_by, min_cashback, max_price) | Very High | Enables Oracle to give ranked recommendations instead of raw dumps. Low engineering complexity — just sort/filter in query layer. |
| 2 | **Product comparison** (GET /api/agent/compare) | Very High | Core unlock. "What's the best deal across merchants?" answered in one call instead of N parallel searches. |
| 3 | **Code examples in OpenAPI** (curl + Python) | High | Reduces time-to-integration by 50%. Auto-generated from spec in <1 hour. |
| 4 | **Quickstart guide + FAQ** | High | Unblocks production evaluations. "How do I get paid?" must be answered clearly. |
| 5 | **MCP client connection guide** | High | Blocks production MCP adoption. 500-word guide + example would fix. |

---

### Developer Experience Quick Wins (Session 1-2)

| Task | Effort | Impact | Session |
|------|--------|--------|---------|
| Add code examples to OpenAPI (curl + Python) | <1h | High | 1 |
| Write "Connect via MCP" quickstart (500 words) | 1-2h | High | 1 |
| Create QUICKSTART.md (registration → search → stats) | 2-3h | Very High | 1-2 |
| Add FAQ (cashback calc, rate limits, SLA) | 1h | High | 2 |
| Auto-generate Python SDK (openapi-generator) | 4-6h | High | 3 |
| Auto-generate TypeScript SDK | 4-6h | High | 3 |

---

## Complete Priority Matrix

| Priority | Task | Issue/Gap | Effort | Blocks | Session |
|----------|------|-----------|--------|--------|---------|
| 🔴 **CRITICAL** | Fix catalog (Fiber API) | Issue 1 | 1-2h | Everything | 1 |
| 🔴 **CRITICAL** | Add auth tokens | Issue 2 | 2-3h | Security | 1 |
| 🔴 **HIGH** | Implement MCP tools | Issue 5 | 3-4h | Oracle MCP | 1 |
| 🔴 **HIGH** | Fix MCP endpoint | Issue 5 | (included) | Oracle MCP | 1 |
| 🟠 **HIGH** | Add API docs link | Issue 6 | 1-2h | Discovery | 1 |
| 🟠 **HIGH** | Add code examples to OpenAPI | DX | <1h | Integration | 1 |
| 🟠 **HIGH** | Write MCP connection guide | DX | 1-2h | MCP Adoption | 1 |
| 🟠 **HIGH** | Create QUICKSTART.md | DX | 2-3h | Onboarding | 1-2 |
| 🟠 **HIGH** | Persist stats | Issue 3 | 3-4h | Production | 2 |
| 🟠 **HIGH** | Implement compare | Gap 1 | 2-3h | Core value | 2 |
| 🟠 **HIGH** | Agent profiling/analytics | Gap 5 | 2-3h | ROI tracking | 2 |
| 🟡 **MEDIUM** | Rate limiting | Issue 4 | 1-2h | Scaling | 2 |
| 🟡 **MEDIUM** | FAQ + SLA documentation | DX | 1h | Trust | 2 |
| 🟡 **MEDIUM** | Deal filtering | Gap 2 | 2-3h | Polish | 3 |
| 🟡 **MEDIUM** | Batch search | Gap 3 | 2-3h | Optimization | 3 |
| 🟢 **LOW** | Python SDK (auto-gen) | DX | 4-6h | Polish | 3+ |
| 🟢 **LOW** | TypeScript SDK (auto-gen) | DX | 4-6h | Polish | 3+ |

**Total Estimated Effort:**
- Session 1 (Critical path + DX quick wins): 8-10 hours (was 6-8h, +2-4h for code examples, MCP guide, QUICKSTART)
- Session 2 (Production + Analytics + DX docs): 10-12 hours (was 8-10h, +1-2h for FAQ/SLA docs, optional QUICKSTART completion)
- Session 3 (Polish + SDKs): 6-8 hours (was 4-6h, +2h for SDK generation)
- **Grand Total: 24-30 hours** to production-ready v1.0.2 with complete DX

---

**Status:** Complete audit delivered. Awaiting Laurent confirmation on:
1. Fiber API status (live or down?)
2. Database choice for Session 2
3. Priority approval for Sessions 1-3
4. Timeline (aggressive: end of week; flexible: next week)
