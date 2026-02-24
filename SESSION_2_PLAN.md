# Session 2 Plan — Production Readiness (8.5/10)

**Timeline:** 10-12 hours  
**Target Score:** 8.5/10 (production-ready for ClawHub + community)  
**Status:** 🚀 STARTING NOW

---

## Overview

Session 1 delivered a working MVP with all core features (auth, MCP, docs). Session 2 focuses on:
1. **Persistent stats** — Database integration for real analytics
2. **Smart comparison** — Compare cashback across merchants
3. **Rich analytics** — Leaderboards, trends, agent profiling
4. **Reliability** — Rate limiting, error handling, monitoring

---

## Task 1: Persist Stats to Database (3-4 hours)

### What to do:
1. **Choose DB:** Postgres (production) or Redis (fast session cache)
   - **Recommended:** Postgres for durability + easy queries
   - **Alternative:** Redis + Postgres hybrid (cache + persistence)

2. **Create schema:**
   ```sql
   -- agents table
   CREATE TABLE agents (
     id SERIAL PRIMARY KEY,
     agent_id VARCHAR(255) UNIQUE NOT NULL,
     agent_name VARCHAR(255),
     wallet_address VARCHAR(255),
     crypto_preference VARCHAR(10),
     auth_token_hash VARCHAR(255),
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );
   
   -- searches table (one row per search)
   CREATE TABLE searches (
     id SERIAL PRIMARY KEY,
     agent_id VARCHAR(255) NOT NULL REFERENCES agents(agent_id),
     keywords VARCHAR(255) NOT NULL,
     results_count INT,
     timestamp TIMESTAMP DEFAULT NOW(),
     FOREIGN KEY(agent_id) REFERENCES agents(agent_id)
   );
   
   -- conversions table (track purchases)
   CREATE TABLE conversions (
     id SERIAL PRIMARY KEY,
     agent_id VARCHAR(255) NOT NULL,
     product_title VARCHAR(255),
     merchant_name VARCHAR(255),
     price DECIMAL(10, 2),
     cashback_rate DECIMAL(5, 2),
     commission_amount DECIMAL(10, 2),
     status VARCHAR(50), -- 'pending', 'confirmed', 'refunded'
     created_at TIMESTAMP DEFAULT NOW(),
     FOREIGN KEY(agent_id) REFERENCES agents(agent_id)
   );
   ```

3. **Update `/api/agent/register.js`:**
   - Save agent to DB instead of in-memory
   - Generate + hash auth token in DB
   - Return token once (can't retrieve later)

4. **Update `/api/agent/[id]/stats.js`:**
   - Query DB for real stats
   - Calculate: total_searches, avg per search, conversions, revenue
   - Return: formatted response with trends

5. **Update `/api/agent/search.js`:**
   - Log search to DB (after Fiber API response)
   - Record results_count, timestamp
   - Update agent's last_activity timestamp

**Files to modify:**
- `api/agent/register.js` — Save to DB
- `api/agent/search.js` — Log searches
- `api/agent/[id]/stats.js` — Query DB
- `api/_lib/db.js` — New: Database utilities (connection, query helpers)

**Success criteria:**
- Agent registration saves to DB
- Searches logged to DB in real-time
- Stats endpoint queries real DB data
- No in-memory resets on cold start
- Token storage is secure (hashed, not plaintext)

**Estimated effort:** 3-4 hours

---

## Task 2: Add `/api/agent/compare` Endpoint (2-3 hours)

### What to do:
1. **Create `/api/agent/compare.js`:**
   - Input: `product_name` (required), `agent_id` (optional), `max_merchants` (optional, default 5)
   - Query Fiber API with product name
   - Return products from same category sorted by cashback rate
   - Show merchant comparison table

2. **Response format:**
   ```json
   {
     "success": true,
     "product_query": "running shoes",
     "agent_id": "agent_001",
     "results": [
       {
         "rank": 1,
         "title": "Nike Pegasus 41",
         "merchant": "Finish Line",
         "price": 145,
         "cashback_rate": 3.25,
         "cashback_amount": 4.71,
         "savings_vs_1st": 0,
         "affiliate_link": "https://fiberagent.shop/r/..."
       },
       {
         "rank": 2,
         "title": "Nike Pegasus 41",
         "merchant": "NIKE",
         "price": 145,
         "cashback_rate": 0.65,
         "cashback_amount": 0.94,
         "savings_vs_1st": -3.77,
         "affiliate_link": "https://fiberagent.shop/r/..."
       }
     ],
     "summary": {
       "best_merchant": "Finish Line",
       "best_cashback_rate": "3.25%",
       "price_range": { "min": 145, "max": 165 },
       "merchant_count": 3
     }
   }
   ```

3. **Add to OpenAPI spec:**
   - Document the endpoint
   - Add code examples (curl, Python, JS)

4. **Add to MCP tools:**
   - Register `compare_cashback` tool with new endpoint
   - Update MCP_INTEGRATION_GUIDE.md with example

**Files to modify:**
- `api/agent/compare.js` — New endpoint
- `api/mcp.js` — Update compare_cashback tool to use real endpoint
- `server/openapi.json` — Add spec
- `MCP_INTEGRATION_GUIDE.md` — Document

**Success criteria:**
- Endpoint returns comparable products
- Cashback properly sorted (highest first)
- Works for any product name
- MCP tool calls endpoint instead of static data

**Estimated effort:** 2-3 hours

---

## Task 3: Analytics Layer (2-3 hours)

### What to do:
1. **Agent Leaderboard Endpoint** (`/api/analytics/leaderboard`):
   - Top 10 agents by conversions
   - Top 10 agents by revenue
   - Top 10 agents by searches
   - Include: agent_id, conversions, revenue, growth_rate

2. **Trending Products Endpoint** (`/api/analytics/trending`):
   - Most searched products in last 7 days
   - Conversion rate per product
   - Revenue per product
   - Top merchants by volume

3. **Agent Profile Analytics** (`/api/agent/{id}/analytics`):
   - Search history (last 30 searches)
   - Conversion rate timeline (daily)
   - Top 5 searched brands
   - Top 5 performed merchants
   - Revenue trend (last 30 days)

4. **Dashboard Updates:**
   - Update StatisticsPage to fetch real leaderboard data
   - Show trending products
   - Display agent performance over time

**Files to create:**
- `api/analytics/leaderboard.js` — Top agents
- `api/analytics/trending.js` — Trending products
- `api/agent/[id]/analytics.js` — Agent deep dive

**Files to update:**
- `src/components/StatisticsPage.js` — Fetch real data from API
- `src/pages/DemoPage.js` — Show leaderboard integration

**Success criteria:**
- Leaderboard fetches top agents from DB
- Trending products show real search + conversion data
- Agent analytics show historical performance
- Dashboard displays actual network metrics (not mock)

**Estimated effort:** 2-3 hours

---

## Task 4: Rate Limiting & Quotas (1-2 hours)

### What to do:
1. **Implement token bucket rate limiting:**
   - 100 requests/minute per agent (configurable)
   - 1000 requests/hour per agent
   - Return `429 Too Many Requests` when exceeded
   - Include `Retry-After` header

2. **Add headers to all responses:**
   ```
   X-RateLimit-Limit: 100
   X-RateLimit-Remaining: 87
   X-RateLimit-Reset: 1645564800
   ```

3. **Create rate limit utilities** (`api/_lib/ratelimit.js`):
   - Check if agent exceeded quota
   - Record request count in Redis (fast)
   - Return remaining quota

4. **Update all agent endpoints:**
   - `/api/agent/search`
   - `/api/agent/register`
   - `/api/agent/compare`
   - `/api/agent/[id]/stats`

**Files to create:**
- `api/_lib/ratelimit.js` — Rate limiting logic

**Files to update:**
- `api/agent/search.js` — Add rate limit check
- `api/agent/register.js` — Add quota check
- `api/agent/compare.js` — Add quota check
- `api/agent/[id]/stats.js` — Add quota check
- `MCP_INTEGRATION_GUIDE.md` — Document rate limits

**Success criteria:**
- Requests are counted per agent
- 429 returned when limit exceeded
- Retry-After header present
- Rate limits don't block legitimate usage

**Estimated effort:** 1-2 hours

---

## Task 5: DX Docs & Troubleshooting (1-2 hours)

### What to do:
1. **Create `TROUBLESHOOTING.md`:**
   - Common errors and solutions
   - Bearer token issues
   - Rate limiting exceeded
   - Fiber API errors (no results, invalid agent)
   - Database connection errors

2. **Create `FAQ.md`:**
   - "How do I earn commissions?"
   - "How long does it take to get paid?"
   - "Can I change my wallet?"
   - "What happens if a user refunds?"
   - "Do you support other tokens?"
   - "How do I verify my agent on-chain?"

3. **Create `SLA.md`:**
   - Uptime commitment (99.9%)
   - Response time SLA
   - Support response time
   - Incident communication

4. **Update existing docs:**
   - QUICKSTART.md — Add error handling section
   - MCP_INTEGRATION_GUIDE.md — Add error codes table
   - CAPABILITIES.md — Clarify rate limits

**Files to create:**
- `TROUBLESHOOTING.md` — Error solutions
- `FAQ.md` — Common questions
- `SLA.md` — Service level agreement

**Files to update:**
- `QUICKSTART.md` — Add troubleshooting tips
- `MCP_INTEGRATION_GUIDE.md` — Add error codes

**Success criteria:**
- All common errors documented
- FAQ covers user questions
- SLA is clear and realistic
- Developers know how to debug issues

**Estimated effort:** 1-2 hours

---

## Testing Checklist (After All Tasks)

- [ ] Register agent, verify saved to DB (not in-memory)
- [ ] Cold start → stats still visible (proving DB persistence)
- [ ] Search for products, verify logged to DB
- [ ] Check `/api/agent/{id}/stats` returns real data
- [ ] Call `/api/agent/compare` with product name
- [ ] Verify compare results sorted by cashback
- [ ] Check `/api/analytics/leaderboard` shows top agents
- [ ] Test rate limiting (make 101 requests, verify 429)
- [ ] Verify Retry-After header on 429
- [ ] Fetch agent analytics, verify trends
- [ ] StatisticsPage loads real data from API
- [ ] MCP compare_cashback tool calls real endpoint
- [ ] All docs updated and accurate

---

## Deployment Checklist

- [ ] All code committed to Git
- [ ] Environment variables set (DB_URL, REDIS_URL, etc.)
- [ ] Database migrations run
- [ ] API tested in production environment
- [ ] StatisticsPage reloads with real data
- [ ] Monitor error logs for 24 hours
- [ ] Update GitHub releases with Session 2 changes
- [ ] Announce on Discord/Reddit: "Session 2 Complete"

---

## Success Criteria for 8.5/10 (Production-Ready)

✅ **All requirements met:**
- Persistent stats (not reset on cold start)
- Comparison endpoint working
- Analytics showing real network data
- Rate limiting protecting API
- Comprehensive documentation
- Error handling + monitoring
- Ready for external developers

✅ **Remaining for 9.2/10 (Session 3):**
- Batch search endpoint
- Agent reputation scoring UI
- Python/TypeScript SDK auto-generation
- Advanced filtering (by price, rating, category)
- Webhook support for purchase tracking

---

## Estimated Total Time

- Task 1 (DB): 3-4h
- Task 2 (Compare): 2-3h
- Task 3 (Analytics): 2-3h
- Task 4 (Rate Limit): 1-2h
- Task 5 (Docs): 1-2h
- **Testing & Deployment:** 1-2h

**Total: 10-16 hours** (targeting 10-12 with parallel work)

---

## Success = 🚀 Production-Ready

When Session 2 is complete:
- Developers can build agents that earn real money
- Stats are persistent and accurate
- API is protected from abuse
- Documentation is comprehensive
- Ready for ClawHub submission
- Ready for community announcement

Go! 🎯
