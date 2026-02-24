# Recommendations for Fiber API Team — FiberAgent Integration

**Date:** Feb 24, 2026  
**From:** FiberAgent (Oracle PM Audit)  
**To:** Fiber API Team  
**Priority:** CRITICAL — Blocking production agent integrations

---

## Current Status

**Good News:** API is live ✅  
**Bad News:** FiberAgent's search endpoint returns `total_results: 0` for all queries  

**Root Cause Hypothesis:** Configuration or integration issue on our side, not data availability.

---

## Immediate Diagnostic Questions

**For Fiber API Team:**

1. **Agent ID Format & Whitelisting**
   - Are agent IDs case-sensitive?
   - Do they need to be pre-registered with Fiber before first API call?
   - Are there any IP whitelisting requirements for sandbox/staging?
   - Can you verify that `agent_id=test` or `agent_id=oracle_001` are recognized?

2. **Authentication & API Key Status**
   - Is the staging API key in our `.env` still valid?
   - When did it last work?
   - Is there a rate limit or throttle in place?
   - Should we be using a different endpoint URL for agent searches?

3. **Request Format Verification**
   - Our current call: `GET /v1/agent/search?keywords=shoes&agent_id=test123&size=10`
   - Does this match your expected format exactly?
   - Are there any additional required parameters (region, category, filter)?
   - Is `size` the right parameter name, or should it be `limit`?

4. **Response Format**
   - When a search succeeds, what does the response structure look like?
   - Field names: `results` vs `products` vs `items`?
   - What does the merchant object contain?
   - Are affiliate URLs auto-generated or do we need to construct them?

5. **Data Availability**
   - How many products are indexed for common keywords (shoes, laptop, monitor)?
   - Is the merchant feed actively updating?
   - Are there any keywords with zero results as a baseline test?

6. **Error Responses**
   - When we get `total_results: 0`, is that a valid response (no matches) or an error state?
   - How do we distinguish between "no products found" vs "API key invalid"?
   - Are there different status codes for these scenarios?

---

## Recommendations for Fiber API

### 1. Add Test Agent Registration (Quick Win)
**Request:** Provide a pre-registered test agent that we can use for debugging
- **Example:** `agent_id=fiberagent_test_001` with known working credentials
- **Purpose:** Rules out ID/whitelist issues
- **Impact:** We can immediately determine if problem is our code or our credentials

### 2. Publish API Integration Guide
**Request:** Create a 1-page integration guide specifically for agent use cases
- Include working cURL example for agent search
- Include Python example using requests library
- Document required vs optional parameters
- Show expected response format with real data
- Document rate limits and pagination
- **Impact:** Reduces integration friction for any agent integrating with Fiber

### 3. Add Health Check Endpoint
**Request:** `GET /v1/health` that returns merchant catalog status
```json
{
  "status": "ok",
  "catalog_products": 50000,
  "merchants_active": 2500,
  "last_update": "2026-02-24T10:30:00Z"
}
```
- **Purpose:** Agents can detect if catalog is available before querying
- **Impact:** Better error handling, faster debugging

### 4. Document Agent-Specific Behavior
**Request:** Clarify how agent-based affiliate links work
- Are affiliate links auto-generated per agent_id?
- Do earnings track correctly per agent across their referrals?
- Is there a test mode to simulate purchases without real transactions?
- What's the lag time for earnings to appear in stats?
- **Impact:** Agents understand how to attribute revenue

### 5. Add Batch Search Endpoint (Future)
**Request:** Consider adding `POST /v1/agent/search/batch` for multi-category queries
```json
{
  "agent_id": "oracle_001",
  "queries": [
    { "keywords": "laptop" },
    { "keywords": "monitor" }
  ]
}
```
- **Purpose:** Agents can do multi-item shopping efficiently in one call
- **Impact:** Reduces API calls 4→1 for typical shopping sessions

### 6. Publish Rate Limits & Quotas
**Request:** Document rate limits per agent_id
- Example: "100 searches/minute per agent_id"
- Example: "10,000 searches/day per agent_id"
- Response headers: X-RateLimit-Limit, X-RateLimit-Remaining, Retry-After
- **Impact:** Agents can design safe, compliant workflows

### 7. Add Webhook Support (Future)
**Request:** Consider webhooks for purchase confirmations
- Agents could be notified when a user completes a purchase
- Would enable real-time earnings updates (not 30-90 day lag)
- **Impact:** Much faster feedback loop for agent ROI visibility

---

## Testing We Can Do on Our Side

**While waiting for Fiber API clarification, we should:**

1. **Test with curl directly** (not through our Node.js wrapper)
   ```bash
   curl "https://api.fiber.shop/v1/agent/search?keywords=shoes&agent_id=fiberagent_test_001"
   ```

2. **Try different parameter formats**
   ```bash
   # Variant 1: POST instead of GET
   curl -X POST https://api.fiber.shop/v1/agent/search \
     -d "keywords=shoes&agent_id=fiberagent_test_001"
   
   # Variant 2: JSON body
   curl -X POST https://api.fiber.shop/v1/agent/search \
     -H "Content-Type: application/json" \
     -d '{"keywords": "shoes", "agent_id": "fiberagent_test_001"}'
   ```

3. **Test with different keywords**
   ```bash
   # Try ultra-common keyword
   curl "https://api.fiber.shop/v1/agent/search?keywords=shoe"
   curl "https://api.fiber.shop/v1/agent/search?keywords=amazon"
   ```

4. **Check API key validity**
   - Verify key is in .env
   - Check if key needs to be passed as header: `Authorization: Bearer <key>`
   - Try key in query param: `?api_key=<key>`

5. **Test without agent_id**
   ```bash
   # See if agent_id is actually required or optional
   curl "https://api.fiber.shop/v1/agent/search?keywords=shoes"
   ```

6. **Check response headers**
   ```bash
   curl -i "https://api.fiber.shop/v1/agent/search?keywords=shoes&agent_id=test"
   # Look for: rate limit headers, error codes, auth issues
   ```

---

## If Fiber API Can't Help

**If Fiber API team says "API is live but we can't debug,"** we should:

1. **Switch to mock data permanently** for v1.0.2
   - Our mock data is high-quality (Nike, Adidas, electronics, etc.)
   - Agents can develop against real data structure
   - We can document: "Using sandbox merchant data; production Fiber API integration pending"

2. **Plan Fiber API integration as v1.1+**
   - Focus on Session 1-2 with mock data
   - Once working, swap in Fiber API when they provide debugging support

3. **Build abstraction layer**
   - Create `/api/agent/search` wrapper that switches between mock and live
   - Allows easy toggle for testing/production

---

## Laurent's Checklist (Before We Start Session 1)

Please confirm/provide:

- [ ] **Fiber API staging endpoint:** (Confirm: `https://api.fiber.shop/v1/agent/search`?)
- [ ] **API key status:** Is the key in our `.env` current and valid?
- [ ] **Test agent ID:** Can you request a pre-registered test agent from Fiber for debugging?
- [ ] **Quick test result:** Can you run this and share the response?
  ```bash
  curl "https://api.fiber.shop/v1/agent/search?keywords=shoes&agent_id=fiberagent_test_001&size=5"
  ```
- [ ] **Contact:** Who at Fiber should we reach out to for quick debugging?

---

## Impact Assessment

**If Fiber API debugging succeeds:**
- ✅ Issue 1 (Catalog 0 results) fixed in <1 hour
- ✅ Session 1 unblocked
- ✅ All downstream features (comparison, batch, etc.) unblocked

**If Fiber API can't provide support:**
- ⚠️ Switch to mock data for v1.0.2
- ⚠️ Plan Fiber API integration for v1.1+
- ✅ Still ship v1.0.2 with mock data (agents can develop against it)

**Timeline impact:** 1 hour (if debug succeeds) vs 0 hours (if using mock data)

---

## Next Steps

1. **Laurent tests with curl** (5 minutes)
2. **Fiber API team confirms** (1-24 hours)
3. **Fix credentials or endpoint** (30 minutes)
4. **Verify with real data** (30 minutes)
5. **Start Session 1** (8-10 hours)

**Total time to production (with Fiber API fix): 18-20 hours** (Sessions 1-2)

---

**Status:** Ready to proceed once we have Fiber API debugging results.
