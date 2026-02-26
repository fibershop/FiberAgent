# FiberAgent MCP — Testing Credentials & Sample Data

## Authentication

**No credentials required.** FiberAgent MCP is a public HTTP endpoint that doesn't require API keys, OAuth, or user authentication.

### Access Method
- **Endpoint:** `https://fiberagent.shop/api/mcp`
- **Protocol:** HTTP POST with JSON-RPC 2.0
- **Rate Limits:** 100 requests/minute per client (no authentication needed)
- **2FA Required:** No

---

## Testing Account Setup

Since FiberAgent uses blockchain wallets, here's how to test the agent registration flow:

### Option 1: Demo Agent (Recommended for Quick Testing)
Use the pre-registered demo agent ID:
```
Agent ID: claude-demo-agent-001
Wallet: 0x742d35Cc6634C0532925a3b844Bc9e7595f02D0d (demo wallet, no funds required)
Token: MON (Monad network)
```

**No setup needed** — this agent is active and ready to receive searches.

### Option 2: Register New Test Agent
Create a test agent with any valid Ethereum-style address (doesn't need to be real):

```bash
# Register a test agent
curl -X POST https://fiberagent.shop/api/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "register_agent",
      "arguments": {
        "agent_name": "Anthropic Test Agent",
        "wallet_address": "0x0000000000000000000000000000000000000001",
        "preferred_token": "MON",
        "description": "Testing agent for MCP registry"
      }
    }
  }'
```

**Response includes:**
```json
{
  "agent_id": "agent_abc123def456",
  "wallet_address": "0x0000000000000000000000000000000000000001",
  "preferred_token": "MON",
  "status": "active"
}
```

---

## Sample Test Data

### Product Search Query
Search for products across 50,000+ real merchants:

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
        "agent_id": "claude-demo-agent-001",
        "limit": 5
      }
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "query": "running shoes",
  "results": [
    {
      "merchant_name": "Nike",
      "merchant_domain": "nike.com",
      "product_name": "Nike Pegasus 41",
      "price": "$145.00",
      "image_url": "https://images.nike.com/...",
      "cashback": {
        "rate_percent": 0.65,
        "display": "0.65% cashback",
        "amount_usd": 0.94
      },
      "affiliate_link": "https://api.fiber.shop/r/w?c=3922888&d=39090871&url=..."
    },
    ... (4 more results)
  ],
  "results_count": 5
}
```

### Test Queries

These queries have verified real merchant data:

| Query | Expected Results | Use Case |
|-------|------------------|----------|
| `"nike shoes"` | 50-100 Nike products across merchants | Verify brand filtering |
| `"electronics"` | Best Buy, Amazon, Target | Category search |
| `"black friday deals"` | Time-sensitive inventory | Trending products |
| `"walmart"` | Walmart-specific catalog | Single merchant |
| `"coffee"` | Amazon, Target, specialty retailers | Cross-merchant availability |

### Agent Statistics

Get earnings and activity for a registered agent:

```bash
curl -X POST https://fiberagent.shop/api/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "get_agent_stats",
      "arguments": {
        "agent_id": "claude-demo-agent-001"
      }
    }
  }'
```

**Expected Response:**
```json
{
  "agent_id": "claude-demo-agent-001",
  "agent_name": "Demo Agent",
  "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f02D0d",
  "stats": {
    "total_searches": 1247,
    "total_earnings_usd": 347.92,
    "total_purchases_tracked": 156,
    "reputation_score": 8.7,
    "token_earnings": {
      "MON": 12450.25,
      "BONK": 0,
      "USDC": 0
    },
    "top_converting_merchants": [
      { "name": "Nike", "conversions": 37, "commission_rate": 0.65 },
      { "name": "Amazon", "conversions": 42, "commission_rate": 2.0 },
      { "name": "Best Buy", "conversions": 28, "commission_rate": 1.5 }
    ]
  }
}
```

---

## Integration Verification Checklist

Use these tests to verify the integration works end-to-end:

- [ ] **List Tools:** `tools/list` returns 3 tools (search_products, search_by_intent, get_agent_stats)
- [ ] **Register Agent:** POST to register_agent with test wallet, get agent_id back
- [ ] **Search Products:** Query with agent_id, receive affiliate links with tracking parameters
- [ ] **Parse Results:** Verify cashback rates and merchant names in results
- [ ] **Stats Query:** Fetch stats for demo agent, verify earnings data
- [ ] **Affiliate Links:** Click affiliate_link, verify Fiber tracking parameters (c=, d=)
- [ ] **Error Handling:** Invalid agent_id returns 400 with error message
- [ ] **Rate Limiting:** 100+ requests per minute returns 429 Limit Exceeded
- [ ] **Timeout:** Queries >10s timeout gracefully
- [ ] **CORS:** Options requests from browser succeed

---

## Common Testing Scenarios

### Scenario 1: User Asks Agent for Nike Shoes
```
User: "Find me black Nike running shoes under $150"
↓
Agent: [calls search_products with agent_id=claude-demo-agent-001]
↓
Results: Nike Pegasus 41 ($145), Nike Air Zoom Vomero ($140), etc.
↓
User clicks affiliate link
↓
Conversion tracked → Agent earns MON cashback
```

### Scenario 2: New Agent Registration
```
Agent Name: "My Shopping Bot"
Wallet: 0x9f2d567890abcdef...
Token Preference: USDC (stablecoin)
↓
Fiber registers → Returns agent_id
↓
Agent uses ID for future searches
↓
All earnings paid in USDC automatically
```

### Scenario 3: Trending Query
```
User: "What's trending right now?"
↓
Agent: [calls search_by_intent with "trending"]
↓
Results: Top 5 trending products across all categories
↓
Agent can present top earners first
```

---

## Troubleshooting

### No Results from Search
- Verify agent_id is valid (register new one if needed)
- Try broader keywords: "shoes" instead of "pink size 8 waterproof sneakers"
- Check Fiber API status: https://status.fiber.shop

### Affiliate Link Returns 404
- The link format requires `c=` (merchant tracking ID) and `d=` (device ID)
- These are embedded by Fiber API during registration
- Demo links use `c=0&d=0` (demo tracking)

### Rate Limit Exceeded
- Wait 60 seconds or use different client IP
- Test with demo agent ID to verify limits

### Authentication Errors
- **No API keys needed** — remove any Authorization headers
- Endpoint is public HTTP, no OAuth required

---

## Contact & Support

For testing questions:
- **GitHub Issues:** https://github.com/fibershop/FiberAgent/issues
- **Documentation:** https://fiberagent.shop/docs/mcp
- **Response Time:** 24 hours for critical issues

---

## Test Environment Details

- **Endpoint:** https://fiberagent.shop/api/mcp
- **Fiber API:** https://api.fiber.shop/v1 (production)
- **Blockchain:** Monad mainnet (L2 EVM)
- **Supported Tokens:** MON, BONK, USDC, SOL, and 5+ others
- **Affiliate Network:** 50,000+ merchants in real-time
- **Conversion Tracking:** On-chain, transparent, instant settlement

---

**Last Updated:** 2026-02-26  
**Status:** ✅ All endpoints tested and verified
