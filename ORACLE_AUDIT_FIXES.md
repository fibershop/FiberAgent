# Oracle Audit — Fix Roadmap

**Status:** Awaiting Laurent confirmation on priorities + Fiber API availability  
**Blocker:** Cannot proceed with fixes until we verify catalog data pipeline is live

---

## Phase A: Unblock Catalog (CRITICAL — Blocks Everything)

**Issue:** `/api/agent/search` returns `total_results: 0` with empty results array

### Diagnosis Checklist
- [ ] Verify `staging.fiber.shop/v1` is responding with merchant data
- [ ] Check if Fiber API key is valid + in `.env`
- [ ] Test Fiber API directly: `curl https://api.staging.fiber.shop/v1/agent/search?keywords=shoes&agent_id=test`
- [ ] Verify merchant feed is not rate-limited or expired
- [ ] Check Vercel function logs for errors in `/api/agent/search.js`

### Fix Steps
1. Restore Fiber API integration (if pipeline is active)
   - Verify endpoint URL is correct
   - Verify API key is current
   - Test with manual curl request
   
2. Add explicit error handling (if data source is permanently unavailable)
   - Return `{ "error": "merchant_catalog_unavailable", "status": 503 }` instead of silent empty results
   - Add debugging note with API endpoint + request params
   
3. Create health check endpoint `/api/health`
   ```javascript
   // Returns { "catalog": "ok" | "error", "timestamp": ... }
   // Agents can hit this to detect failures programmatically
   ```

4. Re-test with Oracle agent:
   ```bash
   curl "https://fiberagent.shop/api/agent/search?keywords=shoes&agent_id=oracle_test_001"
   # Should return: { "total_results": > 0, "results": [...] }
   ```

**Estimated Time:** 1-2 hours (1h if pipeline is active, 3h+ if need to debug data source)

**Success Criteria:**
- [ ] `/api/health` returns `{ "catalog": "ok" }`
- [ ] `/api/agent/search?keywords=shoes` returns `total_results > 0`
- [ ] Oracle can retrieve products + cashback rates

---

## Phase B: Add Authentication (HIGH PRIORITY)

**Issue:** No auth on API = stat scraping + data exposure risk

### Implementation
1. **Modify `/api/agent/register.js`**
   ```javascript
   // On registration, return:
   {
     "agent_id": "agent_xyz",
     "auth_token": "sk_live_abc123...",  // JWT or signed UUID
     "created_at": "2026-02-24T..."
   }
   ```

2. **Add auth middleware** to protected endpoints:
   - `/api/agent/search` (optional: auth_token in query or header)
   - `/api/agent/{id}/stats` (required: auth_token)
   - `/api/agent/{id}` (optional: auth_token)
   
3. **Validation flow:**
   ```javascript
   // Middleware
   const token = req.headers.authorization?.split(' ')[1] || req.query.auth_token;
   if (!validateToken(token, agent_id)) {
     return { error: "unauthorized", status: 401 };
   }
   ```

4. **Store token securely:**
   - Hash token before storing (never store plaintext)
   - Use HMAC(agent_id + secret) or JWT with expiry
   - Option: Redis for fast lookups

5. **Add token rotation endpoint**
   ```
   POST /api/agent/{id}/rotate-token
   Authorization: Bearer {old_token}
   Response: { "auth_token": "sk_live_new_..." }
   ```

6. **Update documentation:**
   - `MCP_INTEGRATION_GUIDE.md` — Add auth examples
   - `SKILL.md` — Document token requirement
   - `README.md` — Security best practices

**Estimated Time:** 2-3 hours

**Success Criteria:**
- [ ] `/api/agent/register` returns `auth_token`
- [ ] `/api/agent/{id}/stats` requires valid Bearer token
- [ ] Unauthorized requests return 401
- [ ] Documentation updated with auth examples

---

## Phase C: Persist Stats (ESSENTIAL FOR PRODUCTION)

**Issue:** Serverless cold start wipes all stats = data loss + unreliable tracking

### Architecture Decision
Choose one:
- **Postgres** (preferred): Durable, queryable, good for agent analytics
- **Redis** (fast): With AOF persistence, suitable for leaderboards
- **DynamoDB** (serverless-native): Auto-scaling, simpler Vercel integration
- **Firestore** (Google): Alternative to DynamoDB

### Implementation
1. **Set up persistence layer** (coordinate with Laurent on which DB)
   ```bash
   # Option A: Postgres on Heroku/Railway
   DATABASE_URL=postgres://...
   
   # Option B: Redis with AOF
   REDIS_URL=redis://...
   
   # Option C: DynamoDB
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=...
   AWS_SECRET_ACCESS_KEY=...
   ```

2. **Update `/api/agent/[id]/stats.js`**
   ```javascript
   // Before: in-memory store (resets on cold start)
   // After: fetch from DB, cache locally for performance
   
   const getStats = async (agent_id) => {
     // 1. Check local cache
     if (statsCache[agent_id]) return statsCache[agent_id];
     
     // 2. Fetch from DB
     const stats = await db.query('SELECT * FROM agent_stats WHERE agent_id = ?', [agent_id]);
     
     // 3. Cache locally
     statsCache[agent_id] = stats;
     
     // 4. Return
     return stats;
   };
   ```

3. **Update `/api/agent/search.js`** to persist search events
   ```javascript
   // Log each search to DB (for analytics)
   await db.query(
     'INSERT INTO search_events (agent_id, keywords, results_count, timestamp) VALUES (?, ?, ?, ?)',
     [agent_id, keywords, results.length, new Date()]
   );
   ```

4. **Add graceful fallback** (if DB is down)
   ```javascript
   try {
     return await db.getStats(agent_id);
   } catch (error) {
     console.error('DB connection failed, using cache');
     return statsCache[agent_id] || { error: 'stats_unavailable' };
   }
   ```

5. **Test with concurrent agents** (verify no race conditions)
   ```bash
   # Simulate 10 agents searching simultaneously
   for i in {1..10}; do
     curl "https://fiberagent.shop/api/agent/search?keywords=shoes&agent_id=agent_$i" &
   done
   wait
   # Verify all agents' stats updated correctly
   ```

**Estimated Time:** 3-4 hours (depending on DB setup)

**Success Criteria:**
- [ ] Stats persist across cold starts
- [ ] Concurrent searches don't lose data
- [ ] Earnings/conversions accumulate correctly
- [ ] Graceful fallback if DB is unavailable

---

## Phase D: Add Rate Limiting (MEDIUM PRIORITY)

**Issue:** No rate limit policy = abuse risk + cost exposure

### Implementation
1. **Choose strategy:**
   - Token bucket: Good for sustained + burst traffic
   - Sliding window: Good for strict per-minute limits
   - Fixed window: Simple, less precise

2. **Implement per-agent limits:**
   ```javascript
   const RATE_LIMITS = {
     search: { requests: 100, window: 60000 }, // 100 req/min
     register: { requests: 10, window: 3600000 }, // 10 req/hour
     stats: { requests: 100, window: 60000 } // 100 req/min
   };
   ```

3. **Add rate limit middleware:**
   ```javascript
   const checkRateLimit = async (agent_id, endpoint) => {
     const key = `ratelimit:${agent_id}:${endpoint}`;
     const count = await redis.incr(key);
     if (count === 1) await redis.expire(key, 60); // 1-minute window
     
     if (count > RATE_LIMITS[endpoint].requests) {
       return {
         status: 429,
         headers: {
           'Retry-After': 60,
           'X-RateLimit-Limit': RATE_LIMITS[endpoint].requests,
           'X-RateLimit-Remaining': 0
         }
       };
     }
     
     return {
       status: 200,
       headers: {
         'X-RateLimit-Limit': RATE_LIMITS[endpoint].requests,
         'X-RateLimit-Remaining': RATE_LIMITS[endpoint].requests - count
       }
     };
   };
   ```

4. **Add to all endpoints:**
   - `/api/agent/register`
   - `/api/agent/search`
   - `/api/agent/{id}/stats`
   - `/api/agent/task` (POST)

5. **Document in API:**
   - `README.md` — Rate limit policy
   - `MCP_INTEGRATION_GUIDE.md` — Handling 429 responses
   - `SKILL.md` — Performance recommendations

**Estimated Time:** 1-2 hours

**Success Criteria:**
- [ ] Requests over limit return 429 with Retry-After header
- [ ] Rate limit headers returned on all responses
- [ ] Documentation includes example backoff strategy

---

## Files to Create/Update

### Create
- [ ] `API_HEALTH_CHECK.md` — Health check deployment + testing
- [ ] `API_SECURITY.md` — Auth mechanism + token rotation best practices
- [ ] `API_RATE_LIMITING.md` — Rate limit policy + examples

### Update
- [ ] `fiber-shop-landing/api/agent/search.js` — Catalog fix + rate limiting
- [ ] `fiber-shop-landing/api/agent/register.js` — Auth token generation
- [ ] `fiber-shop-landing/api/agent/[id]/stats.js` — Persistence layer + caching
- [ ] `fiber-shop-landing/api/mcp.js` — Rate limit headers
- [ ] `fiber-shop-landing/public/.well-known/agent-card.json` — Update auth requirement
- [ ] `MCP_INTEGRATION_GUIDE.md` — Add auth + error handling examples
- [ ] `SKILL.md` — Security + rate limit documentation
- [ ] `README.md` — Add "Production Readiness" section
- [ ] `memory/2026-02-24-oracle-audit.md` — Progress tracking

---

## Distribution Gating

**Do NOT publish v1.0.2 until:**
- [ ] Phase A complete (catalog returns results)
- [ ] Phase B complete (auth working)
- [ ] All documentation updated
- [ ] Oracle agent successfully integrates

**Do NOT submit to ClawHub until:**
- [ ] All 4 phases complete + tested
- [ ] README includes "Known Issues" section (if any)
- [ ] Health check endpoint verified

---

## Rollout Plan

### Week 1 (Feb 24-28):
- [ ] Phase A (catalog) — TODAY
- [ ] Phase B (auth) — FEB 25
- [ ] Phase C (persistence) — FEB 26-27
- [ ] Phase D (rate limiting) — FEB 27

### Week 2 (Mar 3+):
- [ ] Integration testing with Oracle + 2+ other agents
- [ ] Documentation review
- [ ] v1.0.2 release + GitHub tag
- [ ] ClawHub submission
- [ ] Community promotion (Reddit, Discord, Dev.to)

---

## Questions Awaiting Laurent

1. **Fiber API:** Is `staging.fiber.shop/v1` live/populated? Or need to debug data source?
2. **Database:** Postgres (preferred), Redis, DynamoDB, or Firestore?
3. **Timeline:** End of week (Feb 28) or flexible?
4. **Distribution:** Pause ClawHub + community promotion until all 4 phases done?

---

**Status:** Ready to start Phase A once Laurent confirms Fiber API status.
