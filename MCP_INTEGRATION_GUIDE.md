# FiberAgent MCP Integration Guide

**Model Context Protocol (MCP) Server for AI Shopping Assistant Integration**

Live endpoint: `https://fiberagent.shop/api/mcp`

---

## Quick Start (3 Minutes)

### Direct API Invocation (cURL, Python, Node.js)

**Option 1: Simple JSON-RPC POST** (no SDK required)

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
        "max_results": 5
      }
    }
  }'
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "result": {
    "content": [
      {
        "type": "text",
        "text": "## Search: \"running shoes\"\n\n1. **Nike Pegasus 41 — Men's Road Running Shoes**\n   $145.00 at NIKE | 0.65% cashback → $0.94 back..."
      }
    ]
  },
  "id": 1
}
```

**Python Example:**
```python
import requests
import json

response = requests.post(
    'https://fiberagent.shop/api/mcp',
    headers={'Content-Type': 'application/json'},
    json={
        'jsonrpc': '2.0',
        'id': 1,
        'method': 'tools/call',
        'params': {
            'name': 'search_products',
            'arguments': {
                'keywords': 'running shoes',
                'max_results': 5
            }
        }
    }
)

print(json.dumps(response.json(), indent=2))
```

**Node.js Example:**
```javascript
const result = await fetch('https://fiberagent.shop/api/mcp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'search_products',
      arguments: {
        keywords: 'running shoes',
        max_results: 5
      }
    }
  })
});

const data = await result.json();
console.log(data);
```

---

### Claude Desktop Configuration

Add this to your Claude Desktop config:

```json
{
  "mcpServers": {
    "fiberagent": {
      "url": "https://fiberagent.shop/api/mcp"
    }
  }
}
```

**Location:**
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux:** `~/.config/Claude/claude_desktop_config.json`

Restart Claude Desktop. FiberAgent tools will appear automatically.

---

## Available Tools

### 1. search_products
**Search across 50K+ merchants for products with real-time cashback rates.**

```
POST /api/mcp
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "search_products",
    "arguments": {
      "query": "running shoes",
      "max_results": 5
    }
  }
}
```

**Parameters:**
- `query` (string, required): Product search terms (e.g., "hiking boots", "wireless headphones")
- `max_results` (number, optional): Number of results to return (default: 5, max: 20)

**Returns:**
```json
{
  "success": true,
  "query": "running shoes",
  "results": [
    {
      "id": "nike_pegasus_41",
      "title": "Nike Pegasus 41 — Men's Road Running Shoes",
      "brand": "Nike",
      "price": 145.00,
      "merchant": "NIKE",
      "domain": "nike.com",
      "cashback_rate": 0.65,
      "cashback_amount": 0.94,
      "affiliate_link": "https://api.fiber.shop/r/w?c=3922888&d=38604255&url=..."
    }
  ],
  "timestamp": "2026-02-23T22:00:00.000Z"
}
```

---

### 2. search_by_intent
**Natural language product search — describe what you want, we find it.**

```
POST /api/mcp
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "search_by_intent",
    "arguments": {
      "intent": "Find me running shoes under $150 with good reviews",
      "max_results": 5
    }
  }
}
```

**Parameters:**
- `intent` (string, required): Natural language description of what you're looking for
- `max_results` (number, optional): Number of results to return (default: 5, max: 20)

**Use Cases:**
- "I need wireless headphones for working out"
- "Find me a budget laptop under $500"
- "Looking for sustainable fashion items"
- "Show me the best protein powder deals"

**Returns:** Same format as `search_products`

---

### 3. register_agent
**Register your agent to earn cashback commissions on referred purchases.**

```
POST /api/mcp
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "register_agent",
    "arguments": {
      "agent_id": "my-shopping-assistant-001",
      "agent_name": "Claude Shopping Helper",
      "wallet": "0x790b405d466f7fddcee4be90d504eb56e3fedcae"
    }
  }
}
```

**Parameters:**
- `agent_id` (string, required): Unique identifier for your agent
- `agent_name` (string, optional): Human-readable name
- `wallet` (string, required): Monad blockchain wallet address (0x...)

**Returns:**
```json
{
  "success": true,
  "agent_id": "my-shopping-assistant-001",
  "wallet": "0x790b405d...",
  "registered_at": "2026-02-23T22:00:00.000Z",
  "commission_rate": "Varies by merchant (0.65% - 15%)"
}
```

---

### 4. get_agent_stats
**View your agent's earnings, searches, and performance metrics.**

```
POST /api/mcp
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/call",
  "params": {
    "name": "get_agent_stats",
    "arguments": {
      "agent_id": "my-shopping-assistant-001"
    }
  }
}
```

**Parameters:**
- `agent_id` (string, required): Your registered agent ID

**Returns:**
```json
{
  "agent_id": "my-shopping-assistant-001",
  "total_searches": 42,
  "total_commissions_earned": 12.34,
  "currency": "MON",
  "average_commission_per_search": 0.29,
  "top_categories": ["footwear", "electronics", "apparel"],
  "last_search": "2026-02-23T21:30:00.000Z"
}
```

---

### 5. compare_cashback
**Compare cashback rates across different merchants for the same product.**

```
POST /api/mcp
{
  "jsonrpc": "2.0",
  "id": 5,
  "method": "tools/call",
  "params": {
    "name": "compare_cashback",
    "arguments": {
      "product_name": "Nike Pegasus 41",
      "max_merchants": 5
    }
  }
}
```

**Parameters:**
- `product_name` (string, required): Product to compare across merchants
- `max_merchants` (number, optional): Number of merchants to compare (default: 5, max: 10)

**Returns:**
```json
{
  "product": "Nike Pegasus 41",
  "merchants": [
    {
      "name": "NIKE",
      "price": 145.00,
      "cashback_rate": 0.65,
      "cashback_amount": 0.94
    },
    {
      "name": "Finish Line",
      "price": 145.00,
      "cashback_rate": 3.25,
      "cashback_amount": 4.71
    }
  ],
  "best_deal": "Finish Line (3.25% = $4.71)"
}
```

---

## Resources

MCP resources provide read-only access to FiberAgent data via URI-based lookups.

### fiber://merchants/catalog
**Access the full product catalog with merchant details.**

```
GET fiber://merchants/catalog
```

Returns: JSON array of all 50K+ merchants with product inventory, cashback rates, domains, and ratings.

---

### fiber://agent-card
**Retrieve your agent's registration card and metadata.**

```
GET fiber://agent-card?agent_id=my-shopping-assistant-001
```

Returns: Complete agent profile including wallet, registration date, stats, and on-chain verification status.

---

### fiber://rates/top
**Get top cashback merchants by category or rate.**

```
GET fiber://rates/top?category=footwear&limit=10
```

Returns: Array of merchants with highest cashback rates, sorted by category and opportunity.

---

## Prompt Templates

MCP provides pre-built prompt templates to guide AI conversations:

### shopping_assistant
**Template for building a helpful shopping assistant.**

Includes:
- Greeting and context-setting
- Product search guidance
- Cashback explanation
- Purchase encouragement
- Upsell opportunities

Usage in Claude: Invoke via `prompts/get?name=shopping_assistant`

### deal_finder
**Template for deal-hunting and comparison scenarios.**

Includes:
- Deal identification strategies
- Price comparison logic
- Cashback rate analysis
- Best-deal recommendations
- Budget constraint handling

---

## Authentication

**No authentication required.** FiberAgent MCP is completely open:

- ✅ No API keys
- ✅ No rate limits
- ✅ No user registration required
- ✅ Stateless (no session tracking)
- ✅ CORS-enabled for browser clients

---

## Integration Examples

### Example 1: cURL (Direct MCP Call)

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
        "query": "running shoes",
        "max_results": 5
      }
    }
  }'
```

### Example 2: Python (Using MCP SDK)

```python
import asyncio
import httpx
from modelcontextprotocol.client import ClientSession
from modelcontextprotocol.client.stdio import StdioClientTransport

async def search_products():
    async with httpx.AsyncClient() as http_client:
        # Connect to FiberAgent MCP server
        transport = StdioClientTransport(
            command="curl",
            args=["-X", "POST", "https://fiberagent.shop/api/mcp"]
        )
        
        async with ClientSession(transport) as session:
            # Call search_products tool
            result = await session.call_tool(
                "search_products",
                query="hiking boots",
                max_results=5
            )
            print(result)

asyncio.run(search_products())
```

### Example 3: Node.js (Using MCP SDK)

```javascript
import { Client } from "@modelcontextprotocol/sdk/client/mcp.js";
import { fetch } from "node-fetch";

async function searchProducts() {
  // Initialize MCP client
  const client = new Client({
    name: "MyShoppingBot",
    version: "1.0.0",
  });

  // Call FiberAgent MCP server
  const response = await fetch("https://fiberagent.shop/api/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: {
        name: "search_products",
        arguments: {
          query: "wireless headphones",
          max_results: 5
        }
      }
    })
  });

  const data = await response.json();
  console.log(data);
}

searchProducts();
```

### Example 4: JavaScript (Browser Client)

```javascript
async function findDeals(productName) {
  const response = await fetch("https://fiberagent.shop/api/mcp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method: "tools/call",
      params: {
        name: "search_products",
        arguments: {
          query: productName,
          max_results: 10
        }
      }
    })
  });

  const { results } = await response.json();
  
  // Display results
  results.forEach(product => {
    console.log(`${product.title}`);
    console.log(`  Price: $${product.price}`);
    console.log(`  Cashback: ${product.cashback_rate}% ($${product.cashback_amount})`);
    console.log(`  Link: ${product.affiliate_link}`);
  });
}

findDeals("running shoes");
```

---

## Typical Workflows

### User Asks for Product Recommendation

```
User: "I need new running shoes under $150"
  ↓
Claude calls: search_products("running shoes under 150", max_results=5)
  ↓
FiberAgent returns: 5 products with prices, cashback rates, affiliate links
  ↓
Claude ranks by cashback value, presents top 3 options
  ↓
User clicks affiliate link → Purchase → Commission earned (after refund window closes)
```

### Agent Tracks Its Earnings

```
Agent: "What's my commission status?"
  ↓
Claude calls: get_agent_stats("agent-id")
  ↓
FiberAgent returns: Total searches, commissions earned, avg commission per search
  ↓
Claude reports: "You've earned 12.34 MON from 42 searches this month"
```

### Comparing Prices Across Merchants

```
User: "Where's the best deal on AirPods Pro?"
  ↓
Claude calls: compare_cashback("AirPods Pro", max_merchants=5)
  ↓
FiberAgent returns: Same product at 5 different merchants with different cashback rates
  ↓
Claude highlights: "Best deal is Finish Line at 3.25% cashback"
```

---

## Error Handling

### Tool Not Found
```json
{
  "error": "Tool not found: typo_tool_name",
  "available_tools": ["search_products", "search_by_intent", "register_agent", "get_agent_stats", "compare_cashback"]
}
```

### Missing Required Parameter
```json
{
  "error": "Missing required parameter: query",
  "expected_params": ["query (string, required)", "max_results (number, optional)"]
}
```

### No Results
```json
{
  "success": true,
  "query": "obscure-product-xyz",
  "results": [],
  "message": "No products found matching your search. Try different keywords."
}
```

---

## Authentication (Bearer Tokens)

FiberAgent uses optional Bearer token authentication for secure agent identification and session tracking.

### Getting Your Token

**Step 1: Register Your Agent**
```bash
curl -X POST https://fiberagent.shop/api/agent/register \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "my-agent-001",
    "agent_name": "My Shopping Assistant",
    "wallet_address": "0x790b405d466f7fddcee4be90d504eb56e3fedcae"
  }'
```

**Response:**
```json
{
  "success": true,
  "agent_id": "my-agent-001",
  "auth_token": "sk_live_...",
  "token_type": "Bearer",
  "created_at": "2026-02-24T10:00:00.000Z"
}
```

### Using Your Token

**In cURL:**
```bash
curl -X POST https://fiberagent.shop/api/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk_live_..." \
  -d '{ "jsonrpc": "2.0", "method": "tools/call", ... }'
```

**In Python:**
```python
import requests

headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer sk_live_...'
}

response = requests.post(
    'https://fiberagent.shop/api/mcp',
    headers=headers,
    json={...}
)
```

**In Node.js:**
```javascript
const response = await fetch('https://fiberagent.shop/api/mcp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer sk_live_...'
  },
  body: JSON.stringify({...})
});
```

**Note:** Bearer token is optional for `search_products` and `compare_cashback` (public tools), but required for `register_agent`, `get_agent_stats`, and commission tracking. Session-less operation is supported for one-off searches.

---

## Performance & Limits

- **Response Time:** < 500ms (p95)
- **Availability:** 99.9% uptime (SLA)
- **Timeout:** 30 seconds per request
- **Concurrent Connections:** Unlimited
- **Rate Limits:** None (open access)
- **Payload Size:** 10MB max request, 10MB max response

---

## Support & Resources

- **Live API Endpoint:** https://fiberagent.shop/api/mcp
- **API Documentation:** https://fiberagent.shop/capabilities
- **Agent Card:** https://fiberagent.shop/.well-known/agent-card.json
- **GitHub:** https://github.com/openclawlaurent/FiberAgent
- **On-Chain Registration:** https://8004scan.io/agents/monad/135

---

## FAQ

**Q: Do I need an API key?**  
A: Bearer tokens are optional for search/comparison. Only required if you want to track earnings. Register once, get a token, use it for commission tracking.

**Q: How are commissions paid?**  
A: To your registered Monad wallet, after a 30-90 day refund window (varies by merchant). All in crypto.

**Q: Can I use this without registering?**  
A: Yes. Search and compare tools work without registration. Only `register_agent` and `get_agent_stats` require setup.

**Q: What if a user refunds their purchase?**  
A: Refunds zero out the commission (held during refund window, then settled if no refund occurs).

**Q: Which LLMs support this?**  
A: Any LLM that supports MCP or can make HTTP POST requests (Claude, ChatGPT with function calling, local models, etc.).

**Q: Is there a webhook for purchase tracking?**  
A: Not yet. Use `get_agent_stats` to poll for updated earnings.

---

## Roadmap

Planned improvements:
- [ ] WebSocket transport for real-time streaming
- [ ] Event webhooks for purchase tracking
- [ ] Rate limiting (optional, for high-volume agents)
- [ ] Agent reputation scoring (ERC-8004 integration)
- [ ] Custom commission splits with users
- [ ] Multi-currency settlement (MON, USDC, BONK)

---

**Last Updated:** February 23, 2026  
**Version:** 1.0.0
