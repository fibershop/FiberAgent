# Test Account Setup Instructions for FiberAgent MCP

## ⚡ TL;DR — No Setup Needed

**The endpoint is public. No authentication. No setup. Just copy-paste.**

```bash
# Test it right now (takes 10 seconds):
curl -X POST https://fiberagent.shop/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'

# Done. You have all 3 tools listed with full schema.
```

---

## Step-by-Step (If You're New to This)

### Step 1: Verify the Endpoint is Live

**What to do:** Open a terminal and run:

```bash
curl -X POST https://fiberagent.shop/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

**What you should see:** A JSON response listing 3 tools:
- `search_products`
- `register_agent`
- `get_agent_stats`

**If you see that → Congratulations, the endpoint works.**

---

### Step 2: Use the Pre-Registered Test Agent

**You don't need to register anything.** We already did.

**Use these credentials (they're ready to go):**
```
Agent ID:       agent_375fe785219e94cf5f2f060e
Wallet Address: 0x742d35Cc6634C0532925a3b844Bc9e7595f02D0d
```

---

### Step 3: Search for Products

**What to do:** Copy and paste this:

```bash
curl -X POST https://fiberagent.shop/api/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "id":1,
    "method":"tools/call",
    "params":{
      "name":"search_products",
      "arguments":{
        "keywords":"shoes",
        "agent_id":"agent_375fe785219e94cf5f2f060e",
        "limit":5
      }
    }
  }'
```

**What you should see:**
- 5 real products (Nike, Adidas, Best Buy, etc.)
- Real prices ($145, $170, $115, etc.)
- Real cashback rates (0.65%, 3.25%, 32.5%, etc.)
- Affiliate links with tracking parameters

**All of this is real data from 50,000+ merchants.**

---

### Step 4: Get Agent Statistics

**What to do:** Copy and paste this:

```bash
curl -X POST https://fiberagent.shop/api/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "id":1,
    "method":"tools/call",
    "params":{
      "name":"get_agent_stats",
      "arguments":{
        "agent_id":"agent_375fe785219e94cf5f2f060e"
      }
    }
  }'
```

**What you should see:**
- Agent name: "Anthropic MCP Review Agent"
- Total searches completed
- Total earnings (in USD)
- Top converting merchants
- Reputation score

---

## That's It.

You now have:
- ✅ Verified the endpoint is live
- ✅ Tested searching 50,000+ merchants
- ✅ Retrieved real earnings data
- ✅ Confirmed affiliate tracking works

---

## Want to Create Your Own Test Agent? (Optional)

If you want to register a fresh agent instead of using the pre-made one:

```bash
curl -X POST https://fiberagent.shop/api/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "id":1,
    "method":"tools/call",
    "params":{
      "name":"register_agent",
      "arguments":{
        "agent_name":"My Test Agent",
        "wallet_address":"0x0000000000000000000000000000000000000001",
        "preferred_token":"MON",
        "description":"Testing MCP registry"
      }
    }
  }'
```

**You'll get back:**
```json
{
  "agent_id": "agent_XXXXXXX...",
  "wallet_address": "0x000...",
  "device_id": 39106401,
  "status": "active"
}
```

**Then use that `agent_id` in subsequent searches instead of `agent_375fe785219e94cf5f2f060e`.**

(But honestly, the pre-registered one is easier — it already has earnings data to show.)

---

## Troubleshooting

### "Connection refused" or "curl: (7)"
**Problem:** Endpoint is not reachable  
**Solution:** 
- Verify you have internet connection
- Check the URL is exactly: `https://fiberagent.shop/api/mcp`
- Try with `curl -v` to see what's happening

### "tools/list" works but "search_products" returns empty
**Problem:** No products found  
**Solution:**
- Try a simpler keyword: "shoes" instead of "pink waterproof size 8 hiking shoes"
- Verify you're using the right agent_id: `agent_375fe785219e94cf5f2f060e`
- Check that your JSON is valid (use an online JSON validator)

### Response is very slow (>5 seconds)
**Problem:** Might be rate limited or server under load  
**Solution:**
- Wait 60 seconds and try again
- Use a different IP if possible
- Check status at https://status.fiber.shop

### "Agent not found" error
**Problem:** Using wrong agent_id  
**Solution:**
- Double-check agent_id is exactly: `agent_375fe785219e94cf5f2f060e`
- If you registered your own, use the agent_id you got back

---

## Success Criteria

You'll know it's working when:

✅ Step 1: `tools/list` returns 3 tools with schemas  
✅ Step 2: `search_products` returns 5 products with real data  
✅ Step 3: `get_agent_stats` returns earnings data  
✅ Step 4: All responses have valid JSON and expected fields  

**If all 4 pass → Everything works. MCP is ready.**

---

## What to Test Next (Optional)

Once you've confirmed the basics:

1. **Search different keywords:**
   - "electronics"
   - "adidas running"
   - "coffee"
   - Results will vary based on merchant inventory

2. **Check affiliate links:**
   - Look at the `affiliate_link` field in search results
   - Notice it includes `c=` (merchant tracking) and `d=39106401` (device ID)
   - These are real Fiber tracking parameters

3. **Error handling:**
   - Try invalid agent_id: `"agent_invalid_xyz"`
   - Try malformed JSON
   - Try very long queries (100+ keywords)
   - You should get sensible error messages

4. **Rate limiting:**
   - Send 150 requests in 60 seconds (100/min limit)
   - 51st request should return 429 "Rate Limit Exceeded"

5. **Timeout behavior:**
   - Submit a search with a very complex keyword that takes >10 seconds
   - Should timeout gracefully with error

---

## Still Stuck?

**Resources:**

- **Full Testing Guide:** https://github.com/fibershop/FiberAgent/blob/main/REGISTRY_TEST_CREDENTIALS.txt
- **API Documentation:** https://fiberagent.shop/docs/mcp
- **GitHub Issues:** https://github.com/fibershop/FiberAgent/issues
- **Quick Start:** https://github.com/fibershop/FiberAgent/blob/main/MCP_QUICKSTART.md

**Contact:** Open an issue on GitHub (response time: 24 hours)

---

## Quick Reference Card

```
ENDPOINT:     https://fiberagent.shop/api/mcp
METHOD:       POST
CONTENT-TYPE: application/json
PROTOCOL:     JSON-RPC 2.0
AUTH:         NONE (public endpoint)

TEST AGENT:
  ID:     agent_375fe785219e94cf5f2f060e
  WALLET: 0x742d35Cc6634C0532925a3b844Bc9e7595f02D0d

TOOLS:
  1. search_products(keywords, agent_id, limit=10)
  2. register_agent(agent_name, wallet_address, preferred_token)
  3. get_agent_stats(agent_id)

SAMPLE QUERY TIME: <200ms average
PRODUCT DATABASE: 50,000+ merchants, real-time
EARNINGS TRACKING: Automatic, on-chain
```

---

**Status: ✅ Ready to test. Copy commands above and run.**
