# FiberAgent Quickstart — From Zero to First Sale in 5 Minutes

Get your AI agent earning cashback commissions in under 5 minutes.

---

## 🚀 Step 1: Register Your Agent (1 Minute)

Every agent needs a wallet address and unique ID.

```bash
curl -X POST https://fiberagent.shop/api/agent/register \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "my-agent-001",
    "agent_name": "My Shopping Bot",
    "wallet_address": "0x790b405d466f7fddcee4be90d504eb56e3fedcae",
    "crypto_preference": "MON"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Agent registered successfully",
  "agent": {
    "agent_id": "my-agent-001",
    "agent_name": "My Shopping Bot",
    "wallet_address": "0x790b405d466f7fddcee4be90d504eb56e3fedcae",
    "crypto_preference": "MON",
    "registered_at": "2026-02-24T10:00:00.000Z"
  },
  "auth_token": "sk_live_abc123...",
  "token_type": "Bearer",
  "created_at": "2026-02-24T10:00:00.000Z",
  "note": "Use auth_token in Authorization header for subsequent API calls: \"Authorization: Bearer <token>\""
}
```

**Save your token!** You'll use it for all future API calls.

---

## 🔍 Step 2: Search for Products (2 Minutes)

Now search for products. Your agent_id will be tracked automatically.

```bash
curl "https://fiberagent.shop/api/agent/search?keywords=nike%20shoes&agent_id=my-agent-001&size=5"
```

**Response:**
```json
{
  "success": true,
  "query": "nike shoes",
  "agent_id": "my-agent-001",
  "total_results": 5,
  "results": [
    {
      "productId": "nike_pegasus_41",
      "title": "Nike Pegasus 41 — Men's Road Running Shoes",
      "brand": "Nike",
      "price": 145.00,
      "shop": {
        "name": "NIKE",
        "domain": "nike.com"
      },
      "cashback": {
        "rate": "0.65%",
        "amount": 0.94
      },
      "affiliate_link": "https://fiberagent.shop/r/...?agent_id=my-agent-001"
    },
    {
      "productId": "nike_vomero_premium",
      "title": "Nike Vomero Premium — Men's Road Running Shoes",
      "brand": "Nike",
      "price": 230.00,
      "shop": {
        "name": "NIKE",
        "domain": "nike.com"
      },
      "cashback": {
        "rate": "0.65%",
        "amount": 1.50
      },
      "affiliate_link": "https://fiberagent.shop/r/...?agent_id=my-agent-001"
    }
  ]
}
```

**What's happening:**
- You searched for "nike shoes"
- FiberAgent found 5 results from real Wildfire merchants
- Each product shows the **cashback rate** and **amount** in USD
- The `affiliate_link` tracks your agent for commissions

---

## 💰 Step 3: Check Your Earnings (1 Minute)

Use your Bearer token to check your stats:

```bash
curl "https://fiberagent.shop/api/agent/my-agent-001/stats" \
  -H "Authorization: Bearer sk_live_abc123..."
```

**Response:**
```json
{
  "success": true,
  "agent_id": "my-agent-001",
  "agent_name": "My Shopping Bot",
  "wallet_address": "0x790b405d466f7fddcee4be90d504eb56e3fedcae",
  "total_searches": 5,
  "total_earnings_mon": 0,
  "total_purchases_tracked": 0,
  "api_calls_made": 2,
  "registered_at": "2026-02-24T10:00:00.000Z",
  "note": "Earnings reflect only completed purchases (after 30-90 day refund window)"
}
```

**Breaking it down:**
- `total_searches`: How many searches your agent made
- `total_earnings_mon`: Commissions earned (in MON) — only counts completed purchases
- `api_calls_made`: Total API requests sent
- Earnings settle 30-90 days after purchase (after refund window closes)

---

## 🛡️ Step 4: Rate Limiting (Session 2 Update)

All endpoints are now **rate-limited for protection**:

| Limit | Value |
|-------|-------|
| Per minute | 100 requests |
| Per hour | 1,000 requests |
| Per day | 5,000 requests |

**Rate limit headers** appear on every response:
```
X-RateLimit-Minute-Limit: 100
X-RateLimit-Minute-Remaining: 99
X-RateLimit-Minute-Reset: 1645564860
```

If you exceed limits, you get a **429 Too Many Requests** response:
```json
{
  "error": "RATE_LIMITED",
  "message": "You have exceeded the request limit",
  "retryable": true,
  "hint": "Please try again in 60 seconds"
}
```

**Best practice:** Check `X-RateLimit-Minute-Remaining` before making requests. If it's low, implement exponential backoff.

For high-volume agents, contact support to request a higher limit.

---

## 📊 Step 5: Access Real-Time Network Statistics

Real-time statistics are now live (Session 2):

```bash
# Network KPIs (agents, searches, purchases, cashback)
curl https://api.fiber.shop/v1/agent/stats/platform

# Top agents by earnings
curl https://api.fiber.shop/v1/agent/stats/leaderboard?limit=10

# 30-day historical trends
curl https://api.fiber.shop/v1/agent/stats/trends?days=30
```

**All endpoints have CORS enabled.** Call them directly from your frontend:

```javascript
const stats = await fetch('https://api.fiber.shop/v1/agent/stats/platform')
  .then(r => r.json());

console.log(`Agents: ${stats.stats.total_agents_registered}`);
console.log(`Searches: ${stats.stats.total_searches}`);
```

Check out the [ARCHITECTURE_SESSION_2_FINAL.md](./ARCHITECTURE_SESSION_2_FINAL.md) for full technical details.

For MCP integration, see [MCP_QUICKSTART.md](./MCP_QUICKSTART.md).

---

## 🐛 Troubleshooting

### "Missing required fields"
```
Error: { "error": "Missing required fields", "required": ["agent_id", "wallet_address"] }
```
**Fix:** Make sure your POST body includes both `agent_id` and `wallet_address`.

### "Agent not found" (on stats call)
```
Error: { "error": "Agent not found" }
```
**Fix:** Check that the `agent_id` in the URL matches the one you registered.

### "No results found"
```json
{ "success": true, "total_results": 0, "results": [] }
```
**Fix:** Try different keywords. "shoes" instead of "athletic footwear" or very specific SKUs.

### "Invalid wallet address"
```
Error: { "error": "Invalid wallet address format" }
```
**Fix:** Use a valid EVM wallet (0x...). Ethereum, Polygon, or Monad addresses work.

### "401 Unauthorized" (on stats call)
```
Error: { "error": "Unauthorized" }
```
**Fix:** Make sure you're passing the Bearer token:
```bash
-H "Authorization: Bearer sk_live_..."
```

---

## 📚 Full Documentation

- **MCP Integration Guide:** [MCP_INTEGRATION_GUIDE.md](./MCP_INTEGRATION_GUIDE.md) — For Claude Desktop, Cursor, local models
- **MCP Quickstart:** [MCP_QUICKSTART.md](./MCP_QUICKSTART.md) — 5-minute MCP setup
- **API Capabilities:** https://fiberagent.shop/capabilities
- **OpenAPI Spec:** https://fiberagent.shop/openapi.json
- **GitHub:** https://github.com/openclawlaurent/FiberAgent

---

## 🎯 What Happens Next?

1. **Your agent searches** → You provide affiliate links (tracked with `agent_id`)
2. **User clicks link** → Shops normally (no signup, no crypto needed for user)
3. **Purchase completes** → Merchant confirms sale (usually 24-48 hours)
4. **Refund window closes** → 30-90 days later (varies by merchant)
5. **You get paid** → Commissions settle to your Monad wallet in MON (or USDC/BONK)
6. **You decide** → Spend earnings, hold, or share with user

---

## 💡 Pro Tips

- **Test with real merchants:** Nike, Amazon, Finish Line, Best Buy all have live cashback
- **Higher cashback = better recommendations:** Macy's and specialty shops often pay 10-15% cashback
- **Track affiliates:** Every search automatically includes your agent_id in links
- **Batch your calls:** Group searches together to minimize API latency
- **Monitor earnings weekly:** Use the stats endpoint to check commission status

---

**Ready?** Start with Step 1 above, then check out the full [MCP_INTEGRATION_GUIDE.md](./MCP_INTEGRATION_GUIDE.md) to integrate with Claude Desktop or Cursor.

**Questions?** Open an issue on [GitHub](https://github.com/openclawlaurent/FiberAgent) or email support@fiber.shop.
