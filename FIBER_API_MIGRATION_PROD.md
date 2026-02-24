# Fiber API Migration to Production

**Date:** Feb 24, 2026  
**Status:** 🔄 In Progress - Waiting for search endpoint fix  
**Old Endpoint:** `https://api.staging.fiber.shop/v1`  
**New Endpoint:** `https://api.fiber.shop/v1`

---

## Test Results

### ✅ What Works on Production

**Agent Registration:**
```bash
curl -X POST "https://api.fiber.shop/v1/agent/register" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "fiberagent_prod_test_001",
    "wallet_address": "0x...",
    "agent_name": "Test Agent"
  }'
```

**Response:** ✅ SUCCESS
```json
{
  "success": true,
  "agent_id": "agent_2dbf947b6ca049b57469cf39",
  "agent_name": "FiberAgent Production Test",
  "registered_at": "2026-02-24T10:56:53.032Z",
  "status": "active"
}
```

**Test Agent ID:** `agent_2dbf947b6ca049b57469cf39`  
**Wallet:** `0x0699bE7e51c21F27e70164c2a1aA76E85B2e5343`

---

### ❌ What's Broken on Production

**Product Search:**
```bash
curl "https://api.fiber.shop/v1/agent/search?keywords=shoes&agent_id=agent_2dbf947b6ca049b57469cf39"
```

**Response:** ❌ 500 ERROR
```json
{
  "success": false,
  "message": "Http Exception",
  "error": "Internal server error",
  "statusCode": 500,
  "timestamp": "2026-02-24T10:56:58.056Z"
}
```

**Issue:** Search endpoint not working on production (likely incomplete migration)

---

## Migration Plan

### Phase 1: Waiting for Fiber (Blocked)
- ⏳ Fiber fixes search endpoint on production
- ⏳ Confirm production merchant catalog is indexed
- ⏳ Test with real products

### Phase 2: Update FiberAgent Code (When Production is Ready)

**Files to Update:**

1. `.env.fiber.test`
   - Change FIBER_API_ENDPOINT from staging to production
   - Update test agent_id to production agent

2. `fiber-shop-landing/api/agent/search.js`
   - Update FIBER_API constant from staging to production
   - Test with new endpoint

3. `fiber-shop-landing/api/agent/register.js`
   - Update registration endpoint to production
   - Test agent creation

4. `fiber-shop-landing/api/_lib/utils.js`
   - Update Fiber API URL constant (if any)

5. Documentation
   - `FIBER_API_TEST_AGENT.md` — Update endpoint and test agent
   - `README.md` — Note production migration
   - `MCP_INTEGRATION_GUIDE.md` — Update endpoint examples

### Phase 3: Testing (When Production Works)

- [ ] Test agent registration on production
- [ ] Test product search with real products
- [ ] Verify affiliate links work
- [ ] Verify earnings tracking
- [ ] Test all endpoints against production
- [ ] Confirm backward compatibility (if staging still exists)

### Phase 4: Rollout

- [ ] Update all code to production endpoint
- [ ] Update documentation
- [ ] Test end-to-end with Oracle workflow
- [ ] Verify Vercel deployment uses production endpoint
- [ ] Monitor for errors and adjust as needed

---

## Interim Solution (Option 1: Keep Staging)

If production has prolonged issues:

1. Continue using staging endpoint for development
2. Update documentation to note staging is temporary
3. Plan migration date when production is stable
4. Add environment variable to switch between endpoints:

```javascript
const FIBER_API = process.env.FIBER_API_ENDPOINT || 'https://api.staging.fiber.shop/v1';
```

---

## Interim Solution (Option 2: Fallback Logic)

Add fallback to staging if production is down:

```javascript
async function searchWithFallback(keywords, agentId, size) {
  // Try production first
  try {
    const response = await fetch(`https://api.fiber.shop/v1/agent/search?...`);
    if (response.ok) return response.json();
  } catch (err) {
    console.warn('Production endpoint failed, trying staging...');
  }
  
  // Fallback to staging
  return fetch(`https://api.staging.fiber.shop/v1/agent/search?...`);
}
```

---

## Questions for Fiber API Team

1. **Search endpoint status:** When will production search endpoint be fixed?
2. **Merchant catalog:** Is the catalog indexed on production?
3. **Test agent:** Do you have a production test agent we can use?
4. **Backward compatibility:** Will staging continue to work during transition?
5. **Parameter format:** Did any parameter names change in production?

---

## Current Fiber API Status

| Endpoint | Staging | Production |
|----------|---------|------------|
| Registration | ✅ Working | ✅ Working |
| Search | ✅ Working | ❌ 500 Error |
| Stats | ✅ Working | ? (not tested yet) |
| Health | ? | ? |

---

## Migration Checklist

- [ ] Fiber fixes production search endpoint
- [ ] Confirm production merchant catalog is live
- [ ] Test all endpoints on production
- [ ] Update FiberAgent code to use production
- [ ] Update documentation
- [ ] Verify Vercel deployment
- [ ] Monitor for errors
- [ ] Plan deprecation of staging endpoint (if needed)

---

## Files Modified During Migration

Once production is ready, these files will change:

```
.env.fiber.test
fiber-shop-landing/api/agent/search.js
fiber-shop-landing/api/agent/register.js
fiber-shop-landing/api/_lib/utils.js (if applicable)
FIBER_API_TEST_AGENT.md
README.md
MCP_INTEGRATION_GUIDE.md
```

---

## Rollback Plan

If production has critical issues:

1. Revert to staging endpoint in code
2. Update documentation to note staging is active
3. Wait for Fiber to fix production
4. Re-test before migrating again

Command to revert:
```bash
git log --oneline | grep "FIBER_API" | head -5
git revert <commit-hash>
```

---

## Status & Next Steps

**Blocked On:** Fiber API team to fix production search endpoint

**When Fiber Confirms Production is Ready:**
1. Run full test suite against production
2. Update code to production endpoint
3. Merge migration changes
4. Deploy to Vercel
5. Monitor for issues

**ETA:** Waiting for Fiber response

---

**Last Updated:** Feb 24, 2026 10:56 UTC  
**Status:** Waiting for Fiber API fix  
**Assigned to:** Laurent (confirm with Fiber team)
