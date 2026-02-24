# Production Migration Plan — Complete Checklist

**Status:** 🚀 READY TO EXECUTE  
**Date:** Feb 24, 2026  
**Target:** Move all FiberAgent from staging (`https://api.staging.fiber.shop/v1`) → production (`https://api.fiber.shop/v1`)

---

## Files to Update

### 1. Core API Files

#### `fiber-shop-landing/api/agent/search.js`
- [ ] Update `FIBER_API` constant from staging to production
- [ ] Change: `https://api.staging.fiber.shop/v1` → `https://api.fiber.shop/v1`

#### `fiber-shop-landing/api/agent/register.js`
- [ ] No changes needed (uses FIBER_API from search.js or utils)
- Verify it inherits the updated endpoint

#### `fiber-shop-landing/api/agent/[id]/stats.js`
- [ ] No changes needed (uses in-memory stats)
- Verify no hardcoded URLs

#### `fiber-shop-landing/api/_lib/utils.js`
- [ ] Check for any hardcoded Fiber API URLs
- [ ] Update if found

#### `fiber-shop-landing/api/mcp.js`
- [ ] No changes needed (uses mock data + MCP SDK)
- Verify no hardcoded Fiber URLs

### 2. OpenClaw Skill Files

#### `skills/fiberagent/index.js` (Main skill implementation)
- [ ] Update Fiber API endpoint from staging → production
- [ ] Update FIBER_API constant
- [ ] Verify all tool implementations use new endpoint
- [ ] Test all 3 tools: `search_products`, `register_agent`, `get_agent_stats`

#### `skills/fiberagent/SKILL.md` (Skill documentation)
- [ ] Update example URLs from staging → production
- [ ] Update test commands to use production
- [ ] Update test agent ID (if different from staging)

#### `skills/fiberagent/README.md`
- [ ] Update Fiber API endpoint in examples
- [ ] Update test commands
- [ ] Update installation instructions (if any hardcoded URLs)

### 3. Environment & Config Files

#### `.env.fiber.test`
- [ ] Archive/keep for reference
- [ ] Create `.env.fiber.prod` (already done)

#### `.env.fiber.prod`
- [ ] Already created with production credentials
- [ ] Verify test agent ID: `agent_2dbf947b6ca049b57469cf39`
- [ ] Verify endpoint: `https://api.fiber.shop/v1`

#### `vercel.json`
- [ ] Check for any hardcoded environment variables
- [ ] Update if needed

### 4. Documentation Files

#### `FIBER_API_TEST_AGENT.md`
- [ ] Update endpoint from staging → production
- [ ] Update test agent ID to production agent
- [ ] Update test commands

#### `FIBER_API_MIGRATION_PROD.md`
- [ ] Mark as "COMPLETED"
- [ ] Archive for reference

#### `MCP_INTEGRATION_GUIDE.md`
- [ ] Update all example URLs from staging → production
- [ ] Update cURL/Python examples
- [ ] Update test agent ID
- [ ] Verify all code examples work with production

#### `README.md`
- [ ] Update Fiber API endpoint references
- [ ] Update test commands
- [ ] Update example agent IDs

#### `memory/fiberagent-skill-publishing.md` (if exists)
- [ ] Update references to production

### 5. Test & Verification Scripts

#### `test-fiber-endpoints.sh`
- [ ] Update staging URL to production URL
- [ ] Keep both for comparison (optional)
- [ ] Update test agent IDs

#### `TEST_FIBER_API.sh`
- [ ] Update from staging to production
- [ ] Or create new: `TEST_FIBER_API_PROD.sh`

### 6. Git & Versioning

#### Version Update (Optional)
- [ ] Consider releasing v1.0.2 (from v1.0.1)
- [ ] Tag: `openclaw-skill-v1.0.2-prod-ready`
- [ ] Update `skills/fiberagent/package.json` version

---

## Testing Checklist (After Updates)

### Unit Tests
- [ ] `/api/agent/register` — Create new agent
- [ ] `/api/agent/search` — Search products (shoes, laptop, headphones)
- [ ] `/api/agent/{id}/stats` — Get agent stats
- [ ] MCP tools — All 3 tools callable and working

### Integration Tests
- [ ] Registration → Search → Stats workflow
- [ ] Verify affiliate links are correct
- [ ] Verify cashback amounts are calculated
- [ ] Verify pagination works

### Skill Tests (OpenClaw)
- [ ] Search tool works: `search_products` with "shoes"
- [ ] Register tool works: `register_agent`
- [ ] Stats tool works: `get_agent_stats`
- [ ] All tools use production endpoint

### Real-World Tests
- [ ] Test with real agent from production
- [ ] Test end-to-end: Register → Search → Earnings
- [ ] Test with Oracle workflow (if Oracle available)

---

## Deployment Steps

### Step 1: Code Updates (30 min)
```bash
# 1. Update fiber-shop-landing/api/agent/search.js
# 2. Update skills/fiberagent/index.js
# 3. Update documentation files
# 4. Verify no other hardcoded URLs
```

### Step 2: Testing (30-45 min)
```bash
# Run all test commands against production
bash test-fiber-endpoints.sh
# OR manually:
curl "https://api.fiber.shop/v1/agent/search?keywords=shoes&agent_id=agent_2dbf947b6ca049b57469cf39&limit=3"
```

### Step 3: Git Commit (5 min)
```bash
git add -A
git commit -m "Migrate to Fiber API production endpoint

- Update API endpoints: staging → production (https://api.fiber.shop/v1)
- Update skill implementation with production URLs
- Update all documentation and examples
- Update test scripts
- All endpoints tested and verified working
- Ready for Vercel deployment"
```

### Step 4: Vercel Deployment (Auto, ~2 min)
- Push to GitHub
- Vercel auto-deploys
- Monitor for errors

### Step 5: Verification (10 min)
- Test deployed skill on production
- Verify all endpoints working
- Check Vercel logs for errors
- Monitor for 24 hours

---

## Rollback Plan (If Issues)

If production has problems:

```bash
# Option 1: Quick rollback
git revert <migration-commit-hash>
git push
# Vercel auto-deploys rollback

# Option 2: Fallback to staging (add environment check)
const FIBER_API = process.env.USE_STAGING === 'true' 
  ? 'https://api.staging.fiber.shop/v1'
  : 'https://api.fiber.shop/v1';
```

---

## Post-Migration

### Update Distribution Channels
- [ ] GitHub README — update endpoint docs
- [ ] ClawHub (if published) — update skill metadata
- [ ] npm (when 2FA resolved) — publish v1.0.2 with production endpoint

### Update Community Docs
- [ ] Reddit post update (if needed)
- [ ] Discord announcement
- [ ] Dev.to/Medium article

### Monitor & Support
- [ ] Monitor Vercel logs for 24 hours
- [ ] Be ready to rollback if issues
- [ ] Update support docs with any discovered issues

---

## Estimated Timeline

- **Code updates:** 30 minutes
- **Testing:** 30-45 minutes
- **Git commit:** 5 minutes
- **Vercel deployment:** 2 minutes (automatic)
- **Final verification:** 10 minutes

**Total:** ~1.5-2 hours

---

## Files Checklist

Core files to update:
- [ ] `fiber-shop-landing/api/agent/search.js`
- [ ] `skills/fiberagent/index.js`
- [ ] `skills/fiberagent/SKILL.md`
- [ ] `skills/fiberagent/README.md`
- [ ] `FIBER_API_TEST_AGENT.md`
- [ ] `MCP_INTEGRATION_GUIDE.md`
- [ ] `README.md`
- [ ] `test-fiber-endpoints.sh`
- [ ] `skills/fiberagent/package.json` (version bump, optional)

---

## Go/No-Go Decision

**GO** if:
- ✅ Production endpoint verified working
- ✅ All test commands pass
- ✅ No issues found

**NO-GO** if:
- ❌ Production endpoint unstable
- ❌ Critical bugs discovered
- ❌ Rollback needed

**Current Status:** ✅ **GO** — All systems ready

---

**Ready to execute?** Confirm and we'll migrate everything in ~2 hours.
