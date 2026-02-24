# Session 1 Execution — Auth + MCP + DX Quick Wins

**Status:** 🚀 STARTING NOW  
**Target Time:** 8-10 hours  
**Target Score:** 6.0/10 (alpha → early access)

---

## Critical Prerequisites

✅ Fiber API working (test agent verified)  
✅ All audit documents completed  
✅ No blockers identified  
✅ Database decision: **Postgres (recommended, or Redis alternative)**  

---

## Tasks (In Order)

### Task 1: Bearer Token Authentication (Issue 2)
**Estimate:** 2-3 hours  
**Depends on:** Nothing (can start now)

**What to do:**
1. ✅ Update `/api/agent/register.js`:
   - Generate JWT token on registration
   - Return: `{ agent_id, auth_token, created_at, wallet_address }`
   - Store token hash in DB (or Redis) with expiry

2. ✅ Update `/api/agent/search.js`:
   - Require Bearer token in Authorization header OR query param
   - Validate token before returning results
   - Return 401 if invalid/missing

3. ✅ Update `/api/agent/[id]/stats.js`:
   - Require Bearer token
   - Return 401 if unauthorized

4. ✅ Add `/api/agent/[id]/rotate-token.js`:
   - Endpoint to rotate auth tokens
   - Require current token to generate new one

5. ✅ Update `MCP_INTEGRATION_GUIDE.md`:
   - Show how to pass Bearer token in cURL
   - Show how to pass token in Python requests
   - Show how to pass token in Node.js fetch

**Files to modify:**
- `fiber-shop-landing/api/agent/register.js`
- `fiber-shop-landing/api/agent/search.js`
- `fiber-shop-landing/api/agent/[id]/stats.js`
- `fiber-shop-landing/api/_lib/utils.js` (add token generation)
- `MCP_INTEGRATION_GUIDE.md`

**Success criteria:**
- Registration returns auth_token
- Search/stats endpoints require Bearer token
- Invalid tokens return 401
- Token examples in documentation

---

### Task 2: MCP JSON-RPC Handler (Issue 5)
**Estimate:** 3-4 hours  
**Depends on:** Task 1 (auth)

**What to do:**
1. ✅ Update `/api/mcp.js`:
   - Handle POST requests with JSON-RPC 2.0 format
   - Parse `{ "jsonrpc": "2.0", "method": "tools/call", "params": {...}, "id": 1 }`
   - Dispatch to tool handlers:
     - `search_products` → `/api/agent/search`
     - `register_agent` → `/api/agent/register`
     - `get_agent_stats` → `/api/agent/{id}/stats`
     - `compare_cashback` → `/api/agent/compare` (will create in S2)
   - Return JSON-RPC response: `{ "jsonrpc": "2.0", "result": {...}, "id": 1 }`

2. ✅ Test with cURL:
   ```bash
   curl -X POST https://fiberagent.shop/api/mcp \
     -H "Content-Type: application/json" \
     -d '{
       "jsonrpc": "2.0",
       "method": "tools/call",
       "params": {
         "name": "search_products",
         "arguments": {
           "keywords": "shoes",
           "agent_id": "agent_51ab9e782a306e789309d5be"
         }
       },
       "id": 1
     }'
   ```

3. ✅ Update `MCP_INTEGRATION_GUIDE.md`:
   - Show working tool invocation examples
   - Show response parsing
   - Show error handling

**Files to modify:**
- `fiber-shop-landing/api/mcp.js`
- `MCP_INTEGRATION_GUIDE.md`

**Success criteria:**
- POST /api/mcp handles JSON-RPC requests
- Tools are callable (search_products, register_agent, get_agent_stats)
- Claude Desktop MCP client can invoke tools
- Examples in documentation

---

### Task 3: Code Examples in OpenAPI (DX Quick Win)
**Estimate:** 1 hour  
**Depends on:** Nothing (can do in parallel)

**What to do:**
1. ✅ Update OpenAPI spec to include `x-code-samples`:
   - Endpoint: GET /agent/search
     - curl example
     - Python requests example
     - Node.js fetch example
   - Endpoint: GET /agent/{id}/stats
     - curl example
     - Python example
     - Node.js example
   - Endpoint: POST /agent/register
     - curl example
     - Python example
     - Node.js example

2. ✅ Format examples to be copy-paste ready

**Files to modify:**
- `fiber-shop-landing/server/openapi.json`

**Success criteria:**
- OpenAPI spec has code examples
- Examples are in curl, Python, Node.js
- Examples work with test agent

---

### Task 4: MCP Connection Quickstart (DX Quick Win)
**Estimate:** 1-2 hours  
**Depends on:** Task 2 (MCP tools work)

**What to do:**
1. ✅ Create `MCP_QUICKSTART.md`:
   - 500-word guide: "Connect Your AI Agent via MCP"
   - 4 sections:
     - What is MCP? (50 words)
     - Getting Started (100 words, endpoint URL)
     - Example: Using search_products tool (150 words, cURL + response)
     - Integrating with Claude Desktop (100 words)

2. ✅ Add working examples:
   - cURL command to list tools
   - cURL command to invoke search_products
   - Real response from Fiber API

**Files to create:**
- `MCP_QUICKSTART.md`

**Success criteria:**
- Developers can follow guide and use MCP tools
- Examples are copy-paste ready
- Guide explains what MCP enables

---

### Task 5: QUICKSTART.md (DX Trust-Builder)
**Estimate:** 2-3 hours  
**Depends on:** Task 1 (auth works)

**What to do:**
1. ✅ Create `QUICKSTART.md`:
   - "Get Started with FiberAgent in 5 Minutes"
   - 5 sections:
     1. Registration (curl example, returns auth_token)
     2. First Search (curl with Bearer token)
     3. Check Earnings (curl to /stats with token)
     4. Use Comparison (coming in S2)
     5. Troubleshooting (common errors)

2. ✅ Include working examples:
   - Use test agent_id for examples
   - Show Bearer token usage
   - Show real responses from Fiber API

**Files to create:**
- `QUICKSTART.md`

**Success criteria:**
- New developer can register → search → check stats
- All examples work with test agent
- Token usage is clear

---

### Task 6: Homepage Developer Link (Issue 6)
**Estimate:** 1 hour  
**Depends on:** Nothing (can do in parallel)

**What to do:**
1. ✅ Update `fiber-shop-landing/src/pages/HomePage.js`:
   - Add "For Developers" section after hero
   - Include:
     - "Get Started" button → /api/docs
     - "MCP Quickstart" button → #MCP_QUICKSTART.md
     - "Install Skill" button → GitHub releases
     - Brief description (2-3 lines)

2. ✅ Update CSS for button styling

**Files to modify:**
- `fiber-shop-landing/src/pages/HomePage.js`
- `fiber-shop-landing/src/pages/HomePage.css` (if needed)

**Success criteria:**
- Homepage has visible "For Developers" section
- Links point to correct resources
- Buttons are styled consistently

---

## Execution Checklist

- [ ] Task 1: Bearer token auth (2-3h)
- [ ] Task 2: MCP JSON-RPC handler (3-4h)
- [ ] Task 3: Code examples in OpenAPI (1h)
- [ ] Task 4: MCP quickstart guide (1-2h)
- [ ] Task 5: QUICKSTART.md (2-3h)
- [ ] Task 6: Homepage developer link (1h)

**Total: 10-13 hours** (targeting 8-10 with parallel work)

---

## Testing Checklist (After Each Task)

- [ ] Test registration returns auth_token
- [ ] Test search requires Bearer token
- [ ] Test stats requires Bearer token
- [ ] Test MCP tool invocation (cURL)
- [ ] Test code examples (copy-paste)
- [ ] Test MCP quickstart (follow guide, make first call)
- [ ] Test homepage loads, developer link visible
- [ ] Test QUICKSTART.md (new user flow)

---

## Database Setup (Defer to Session 2)

For now: Use in-memory token store (utils.js) with note about Session 2 persistence

Session 2 will migrate to:
- Postgres (for time-series stats + tokens)
- Or Redis (for faster token lookup)

---

## Git Commits

After each task:
```
git add -A
git commit -m "S1.Task-N: Brief description"
```

---

## Score Tracking

**Target Score: 6.0/10 (Alpha)**

Current (v1.0.1): 3.6/10
- API Architecture: 6/10
- MCP Integration: 3/10 ← will fix to 8/10
- Frontend: 4/10 ← will fix to 6/10
- Documentation: 3/10 ← will fix to 7/10
- Agent Readiness: 2/10 ← will fix to 5/10 (partially)

After Session 1: 6.0/10
- API Architecture: 6/10 → 7/10 (auth added)
- MCP Integration: 3/10 → 8/10 (tools callable)
- Frontend: 4/10 → 6/10 (developer discovery)
- Documentation: 3/10 → 7/10 (code examples, quickstart)
- Agent Readiness: 2/10 → 5/10 (can register, search, check stats)

---

## Next (Session 2 Preview)

- Persist stats (Issue 3) — move to DB
- Rate limiting (Issue 4)
- Product comparison (Gap 1)
- Analytics layer (Gap 5)
- FAQ + SLA docs (DX)

Target: 8.5/10 (Production Ready)

---

**Starting now. Status updates per task completion.** 🚀
