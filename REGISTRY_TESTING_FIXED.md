# FiberAgent MCP - Registry Testing (Updated Feb 26, 2026)

## ✅ All Tools Accept agent_id Parameter (No Session Registration Required)

Use the pre-registered test agent to verify all tools work.

### Test Agent
- **Agent ID:** `agent_c47922c509c79292144d4701`
- **Endpoint:** `https://fiberagent.shop/api/mcp`
- **Note:** No registration needed — pass agent_id directly

---

## Test Commands

### 1️⃣ List All Tools
```bash
curl -X POST https://fiberagent.shop/api/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "id": 1
  }'
```

**Expected:** Returns array of 5 tools

---

### 2️⃣ Search Products (Using Provided Agent)
```bash
curl -X POST https://fiberagent.shop/api/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "search_products",
      "arguments": {
        "keywords": "Nike shoes",
        "agent_id": "agent_c47922c509c79292144d4701"
      }
    },
    "id": 2
  }'
```

**Expected:** Markdown table with products, prices, merchants, cashback %, and affiliate links

---

### 3️⃣ Search by Intent (Natural Language)
```bash
curl -X POST https://fiberagent.shop/api/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "search_by_intent",
      "arguments": {
        "intent": "Find running shoes under $150",
        "agent_id": "agent_c47922c509c79292144d4701"
      }
    },
    "id": 3
  }'
```

**Expected:** Running shoes filtered by price, sorted by relevance

---

### 4️⃣ Get Agent Stats
```bash
curl -X POST https://fiberagent.shop/api/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "get_agent_stats",
      "arguments": {
        "agent_id": "agent_c47922c509c79292144d4701"
      }
    },
    "id": 4
  }'
```

**Expected:** Agent registration details, earnings, statistics

---

### 5️⃣ Compare Cashback Across Merchants
```bash
curl -X POST https://fiberagent.shop/api/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "compare_cashback",
      "arguments": {
        "product_query": "Air Force 1",
        "agent_id": "agent_c47922c509c79292144d4701"
      }
    },
    "id": 5
  }'
```

**Expected:** Same product across merchants with varying cashback rates

---

### 6️⃣ Register New Agent (Optional)
If you want to test with your own wallet:

```bash
curl -X POST https://fiberagent.shop/api/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "register_agent",
      "arguments": {
        "wallet_address": "0xYourTestWalletHere123456789..."
      }
    },
    "id": 6
  }'
```

**Expected:** Returns new `agent_id` that can be used in subsequent searches

Then use the returned `agent_id` in tests 2-5 above.

---

## Key Features Verified

✅ **No Authentication** — Endpoint is completely public
✅ **Agent ID Reuse** — Same agent_id works across multiple requests (no re-registration)
✅ **Real Affiliate Links** — All links include tracking parameters (c=merchant_id, d=device_id)
✅ **Markdown Tables** — Product results render as tables with inline images
✅ **Live Data** — Prices and cashback rates update from Fiber API
✅ **Stateless** — Works across different sessions/requests with same agent_id

---

## Documentation Links

- **Full Docs:** https://fiberagent.shop/docs/mcp
- **Privacy:** https://fiberagent.shop/privacy
- **Support:** https://github.com/fibershop/FiberAgent/issues (24h SLA)
- **GitHub:** https://github.com/fibershop/FiberAgent

---

## Session Registration Example (If Needed)

If using a new wallet, follow this flow:

```bash
# Step 1: Register
RESPONSE=$(curl -s -X POST https://fiberagent.shop/api/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "register_agent",
      "arguments": {
        "wallet_address": "0xYourWallet123..."
      }
    },
    "id": 1
  }')

# Extract agent_id from response and use in searches
AGENT_ID=$(echo $RESPONSE | jq -r '.result.content[0].text' | grep -oP 'agent_[a-z0-9]+')

# Step 2: Search with your agent_id
curl -X POST https://fiberagent.shop/api/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d "{
    \"jsonrpc\": \"2.0\",
    \"method\": \"tools/call\",
    \"params\": {
      \"name\": \"search_products\",
      \"arguments\": {
        \"keywords\": \"Nike shoes\",
        \"agent_id\": \"$AGENT_ID\"
      }
    },
    \"id\": 2
  }"
```

---

**Last Updated:** Feb 26, 2026 (Session 3.2)
**Status:** ✅ All tests verified working
**Endpoint:** https://fiberagent.shop/api/mcp
