# FiberAgent MCP Quickstart — 5 Minutes to Your First Search

Get started with FiberAgent's Model Context Protocol in under 5 minutes.

---

## What is MCP?

The Model Context Protocol (MCP) is an open standard that lets AI assistants call tools and access resources securely. FiberAgent is an MCP server—think of it as a shopping skill that any AI can install. Once connected, Claude, ChatGPT, or your local agent can search 50K+ merchants, compare cashback rates, and track earnings using natural language. No API key, no friction. Just "Find me shoes" and your AI handles the rest.

---

## Getting Started (2 Minutes)

### 1. Check the Endpoint

FiberAgent MCP is live at: **`https://fiberagent.shop/api/mcp`**

### 2. Make Your First Call

Use cURL to test the JSON-RPC interface:

```bash
curl -X POST https://fiberagent.shop/api/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "search_products",
      "arguments": {
        "keywords": "nike shoes"
      }
    }
  }'
```

That's it! FiberAgent will return product results with prices and cashback rates.

---

## Example: Searching for Products (2 Minutes)

Let's search for running shoes and see the response.

### Request:
```bash
curl -X POST https://fiberagent.shop/api/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "search_products",
      "arguments": {
        "keywords": "running shoes",
        "max_results": 3
      }
    }
  }'
```

### Response:
```json
{
  "jsonrpc": "2.0",
  "result": {
    "content": [
      {
        "type": "text",
        "text": "## Search: \"running shoes\"\n\n1. **Nike Pegasus 41 — Men's Road Running Shoes**\n   $145.00 at NIKE | 0.65% cashback → $0.94 back\n\n2. **Nike Vomero Premium — Men's Road Running Shoes**\n   $230.00 at NIKE | 0.65% cashback → $1.50 back\n\n3. **Adidas Ultraboost 5 Running Shoes**\n   $190.00 at Adidas | 3.5% cashback → $6.65 back\n\n---\n*3 products from Fiber's 50K+ merchant network.*"
      }
    ]
  },
  "id": 1
}
```

**What you're seeing:**
- Product names, prices, and merchants
- Cashback **rate** (percentage) and **amount** in USD/crypto
- All from real Wildfire merchants (Nike, Adidas, Amazon, Best Buy, etc.)

---

## Integrating with Claude Desktop (1 Minute)

Want Claude to use FiberAgent automatically? Add it to your Claude Desktop config.

### macOS / Linux
Edit `~/.config/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "fiberagent": {
      "url": "https://fiberagent.shop/api/mcp"
    }
  }
}
```

### Windows
Edit `%APPDATA%\Claude\claude_desktop_config.json` (same config).

### Reload
Restart Claude Desktop. You'll see FiberAgent appear in the tools list. Now just ask:

```
"Find me wireless headphones under $200"
"Compare Nike Air Force 1 across merchants"
"What's the best deal on creatine monohydrate?"
```

Claude will automatically use FiberAgent to search, compare, and show you results with cashback included.

---

## Available Tools

### 1. `search_products`
Search by keywords. Parameters: `keywords` (required), `max_results` (optional, default 5).

### 2. `search_by_intent`
Natural language search. Parameters: `intent` (e.g., "Find shoes under $150 with highest cashback"), `max_results` (optional).

### 3. `register_agent`
Register your agent to earn cashback. Parameters: `agent_id` (required), `wallet_address` (required), `agent_name` (optional).

### 4. `get_agent_stats`
Check your agent's earnings. Parameters: `agent_id` (required).

### 5. `compare_cashback`
Compare the same product across merchants. Parameters: `product_name` (required), `max_merchants` (optional).

---

## Rate Limiting (Session 2 Update)

All MCP endpoints are **rate limited for protection**:

```
100 requests per minute (per agent_id)
1,000 requests per hour
5,000 requests per day
```

### Rate Limited Response (429):
```json
{
  "success": false,
  "error": "RATE_LIMITED",
  "message": "You have exceeded the request limit",
  "statusCode": 429,
  "retryable": true,
  "hint": "Please try again in 60 seconds"
}
```

### Rate Limit Headers (on all responses):
```
X-RateLimit-Minute-Limit: 100
X-RateLimit-Minute-Remaining: 99
X-RateLimit-Minute-Reset: 1645564860
Retry-After: 60  (only when rate limited)
```

**Best Practice:** Check `X-RateLimit-Minute-Remaining` header before making requests. If it's low (< 10), implement exponential backoff.

---

## Real-Time Statistics (Session 2 - New!)

In Session 2, we added live network statistics endpoints:

```bash
# Network KPIs
curl https://api.fiber.shop/v1/agent/stats/platform

# Top agents leaderboard
curl https://api.fiber.shop/v1/agent/stats/leaderboard?limit=10

# Historical trends
curl https://api.fiber.shop/v1/agent/stats/trends?days=30
```

**All endpoints have CORS enabled** — call them directly from your browser:

```javascript
const stats = await fetch('https://api.fiber.shop/v1/agent/stats/platform')
  .then(r => r.json());

console.log(`Active agents: ${stats.stats.active_agents}`);
console.log(`Total searches: ${stats.stats.total_searches}`);
```

See [ARCHITECTURE_SESSION_2_FINAL.md](../ARCHITECTURE_SESSION_2_FINAL.md) for technical details.

---

## Troubleshooting

**Q: Got an error "Tool not found"?**  
A: Check the tool name spelling. Use exact names: `search_products`, `register_agent`, etc.

**Q: No results returned?**  
A: Try different keywords. "nike" instead of "n1k3" or very specific product codes.

**Q: Getting 429 "Too Many Requests"?**  
A: You've exceeded the rate limit. Wait for the `Retry-After` header (default 60s), then retry. For high-volume agents, contact support.

**Q: How do I earn commissions?**  
A: Register with `register_agent`, then searches you make will track affiliate links. After a purchase completes (30-90 day refund window), you get paid in crypto to your wallet.

**Q: Can I increase the rate limit?**  
A: Yes! Contact support with your `agent_id` and use case. We can whitelist high-volume agents.

---

## Next Steps

- **Full Integration Guide:** See [MCP_INTEGRATION_GUIDE.md](./MCP_INTEGRATION_GUIDE.md)
- **API Documentation:** https://fiberagent.shop/capabilities
- **GitHub:** https://github.com/fibershop/FiberAgent

---

**Questions?** Open an issue on GitHub or check the [FAQ in the integration guide](./MCP_INTEGRATION_GUIDE.md#faq).
