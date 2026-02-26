# MCP Registry Submission — Form Copy

**Ready to paste directly into Anthropic's MCP registry form.**

---

## Testing Account Credentials

```
NO AUTHENTICATION REQUIRED
Endpoint is completely public — no API keys, no OAuth, no 2FA.

REAL REGISTERED TEST AGENT (Live on Fiber API):
Agent ID:       agent_375fe785219e94cf5f2f060e
Wallet Address: 0x742d35Cc6634C0532925a3b844Bc9e7595f02D0d
Device ID:      39106401
Blockchain:     Monad
Token Payout:   MON

INSTANT TEST (Copy & Paste):

1. List all tools:
curl -X POST https://fiberagent.shop/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'

2. Search for products:
curl -X POST https://fiberagent.shop/api/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0","id":1,"method":"tools/call",
    "params":{"name":"search_products","arguments":{
      "keywords":"shoes","agent_id":"agent_375fe785219e94cf5f2f060e","limit":3
    }}
  }'

3. Get agent stats:
curl -X POST https://fiberagent.shop/api/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0","id":1,"method":"tools/call",
    "params":{"name":"get_agent_stats","arguments":{
      "agent_id":"agent_375fe785219e94cf5f2f060e"
    }}
  }'

All commands work immediately. Real products, real merchants, real earnings tracking.
```

---

## Documentation Link

```
https://github.com/fibershop/FiberAgent/blob/main/REGISTRY_TEST_CREDENTIALS.txt
```

(Contains more sample queries and troubleshooting guide)

---

## Support Contact

```
GitHub Issues: https://github.com/fibershop/FiberAgent/issues
Response Time: 24 hours for critical issues
```

---

## Key Points

- ✅ **No setup required** — Test agent already registered
- ✅ **No credentials needed** — Public HTTP endpoint
- ✅ **Real data** — 50,000+ merchants, real affiliate tracking
- ✅ **Live earnings** — Wallet tracks conversions automatically
- ✅ **Copy-paste commands** — All examples tested and working
- ✅ **Instant feedback** — Results returned in <200ms average

---

## What Anthropic Will Get

Running any of the curl commands above will:
1. Connect to https://fiberagent.shop/api/mcp (live endpoint)
2. Use agent_375fe785219e94cf5f2f060e (pre-registered)
3. Return real product data from 50,000+ merchants
4. Show real cashback rates (0.65% Nike, 3.25% Finish Line, 32.5% DHGate, etc.)
5. Include tracking parameters (device ID 39106401 baked into affiliate links)
6. All earnings credited to wallet 0x742d35Cc6634C0532925a3b844Bc9e7595f02D0d

**Zero friction. Zero setup. Pure testing.**
